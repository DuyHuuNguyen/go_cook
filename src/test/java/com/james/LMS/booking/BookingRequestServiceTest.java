package com.james.LMS.booking;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.james.LMS.config.ChefBookingProperties;
import com.james.LMS.entity.Booking;
import com.james.LMS.entity.BookingItemDish;
import com.james.LMS.entity.BookingRequest;
import com.james.LMS.entity.ChefProfile;
import com.james.LMS.entity.ChefSchedule;
import com.james.LMS.entity.Dish;
import com.james.LMS.entity.User;
import com.james.LMS.enums.BookingRequestStatus;
import com.james.LMS.enums.BookingStatus;
import com.james.LMS.enums.ChefApplicationStatus;
import com.james.LMS.enums.ChefScheduleStatus;
import com.james.LMS.exception.BookingRequestException;
import com.james.LMS.exception.EntityNotFoundException;
import com.james.LMS.repository.BookingRepository;
import com.james.LMS.repository.BookingRequestRepository;
import com.james.LMS.repository.ChefProfileRepository;
import com.james.LMS.repository.ChefScheduleRepository;
import com.james.LMS.repository.DishRepository;
import com.james.LMS.repository.UserRepository;
import com.james.LMS.service.impl.BookingRequestServiceImpl;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookingRequestServiceTest {
  @Mock BookingRepository bookings;
  @Mock BookingRequestRepository requests;
  @Mock UserRepository users;
  @Mock ChefProfileRepository profiles;
  @Mock DishRepository dishes;
  @Mock ChefScheduleRepository schedules;
  ChefBookingProperties properties;
  BookingRequestServiceImpl service;

  @BeforeEach
  void setUp() {
    properties = new ChefBookingProperties();
    service =
        new BookingRequestServiceImpl(
            requests, bookings, users, profiles, dishes, schedules, properties);
  }

  @Test
  void createsPendingRequestAndHeldScheduleForPartialDishMatch() {
    Instant mealAt = Instant.now().plus(Duration.ofHours(5));
    Booking booking = booking(mealAt);
    User chef = chef();
    eligible(booking, chef);
    when(profiles.findMatchedProfileDishIds(List.of(7L), List.of(10L, 20L)))
        .thenReturn(List.<Object[]>of(new Object[] {12L, 10L}));
    when(requests.saveAndFlush(any(BookingRequest.class)))
        .thenAnswer(
            invocation -> {
              BookingRequest saved = invocation.getArgument(0);
              return BookingRequest.builder()
                  .id(99L)
                  .booking(saved.getBooking())
                  .chef(saved.getChef())
                  .status(saved.getStatus())
                  .expiresAt(saved.getExpiresAt())
                  .build();
            });
    when(schedules.save(any(ChefSchedule.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(bookings.save(booking)).thenReturn(booking);

    var response = service.create(1L, 12L, 5L);

    assertEquals(99L, response.requestId());
    assertEquals("PENDING", response.requestStatus());
    assertEquals("PENDING_CHEF_ACCEPTANCE", response.bookingStatus());
    assertEquals(mealAt.minus(Duration.ofHours(2)), response.scheduleStartAt());
    assertEquals(mealAt, response.scheduleEndAt());
    assertTrue(response.expiresAt().isAfter(Instant.now().plus(Duration.ofMinutes(29))));
    ArgumentCaptor<ChefSchedule> captured = ArgumentCaptor.forClass(ChefSchedule.class);
    verify(schedules).save(captured.capture());
    assertEquals(ChefScheduleStatus.HELD, captured.getValue().getStatus());
    assertEquals(response.expiresAt(), captured.getValue().getHoldExpiresAt());
    verify(schedules)
        .countBlockingOverlaps(
            eq(12L),
            eq(response.scheduleStartAt()),
            eq(mealAt),
            any(),
            eq(ChefScheduleStatus.CONFIRMED),
            eq(ChefScheduleStatus.HELD));
  }

  @Test
  void rejectsBookingOwnedByAnotherCustomer() {
    when(bookings.lockOwnedBooking(1L, 5L)).thenReturn(Optional.empty());
    assertThrows(EntityNotFoundException.class, () -> service.create(1L, 12L, 5L));
    verify(users, never()).lockScheduleOwner(any());
  }

  @Test
  void rejectsNonSelectableBookingBeforeLockingChef() {
    Booking booking = booking(Instant.now().plus(Duration.ofHours(5)));
    booking.setBookingStatus(BookingStatus.PENDING_CHEF_ACCEPTANCE.name());
    when(bookings.lockOwnedBooking(1L, 5L)).thenReturn(Optional.of(booking));

    assertEquals(
        "BOOKING_NOT_SELECTABLE",
        assertThrows(BookingRequestException.class, () -> service.create(1L, 12L, 5L))
            .getErrorCode());
    verify(users, never()).lockScheduleOwner(any());
  }

  @Test
  void rejectsConflictingScheduleWithoutWriting() {
    Booking booking = booking(Instant.now().plus(Duration.ofHours(5)));
    eligible(booking, chef());
    when(profiles.findMatchedProfileDishIds(List.of(7L), List.of(10L, 20L)))
        .thenReturn(List.<Object[]>of(new Object[] {12L, 10L}));
    when(schedules.countBlockingOverlaps(
            eq(12L),
            any(),
            any(),
            any(),
            eq(ChefScheduleStatus.CONFIRMED),
            eq(ChefScheduleStatus.HELD)))
        .thenReturn(1L);

    assertEquals(
        "CHEF_SCHEDULE_CONFLICT",
        assertThrows(BookingRequestException.class, () -> service.create(1L, 12L, 5L))
            .getErrorCode());
    verify(requests, never()).saveAndFlush(any());
    verify(schedules, never()).save(any());
    assertEquals(BookingStatus.PENDING.name(), booking.getBookingStatus());
  }

  @Test
  void rejectsChefOutsideServiceArea() {
    Booking booking = booking(Instant.now().plus(Duration.ofHours(5)));
    when(bookings.lockOwnedBooking(1L, 5L)).thenReturn(Optional.of(booking));
    when(users.lockScheduleOwner(12L)).thenReturn(Optional.of(chef()));
    when(profiles.findByUserId(12L)).thenReturn(Optional.of(profile()));
    when(profiles.hasActiveChefRole(12L)).thenReturn(true);

    assertEquals(
        "CHEF_AREA_MISMATCH",
        assertThrows(BookingRequestException.class, () -> service.create(1L, 12L, 5L))
            .getErrorCode());
    verify(schedules, never()).save(any());
  }

  @Test
  void expiresRequestAndReleasesHeldSchedule() {
    Booking booking = booking(Instant.now().plus(Duration.ofHours(5)));
    booking.setBookingStatus(BookingStatus.PENDING_CHEF_ACCEPTANCE.name());
    BookingRequest request =
        BookingRequest.builder()
            .id(99L)
            .booking(booking)
            .chef(chef())
            .status(BookingRequestStatus.PENDING)
            .expiresAt(Instant.now().minusSeconds(1))
            .build();
    ChefSchedule schedule = ChefSchedule.builder().status(ChefScheduleStatus.HELD).build();
    when(requests.findBookingIdById(99L)).thenReturn(Optional.of(1L));
    when(bookings.lockById(1L)).thenReturn(Optional.of(booking));
    when(requests.findById(99L)).thenReturn(Optional.of(request));
    when(schedules.findByBooking_IdAndChef_IdAndStatus(1L, 12L, ChefScheduleStatus.HELD))
        .thenReturn(List.of(schedule));

    service.expireDueRequest(99L);

    assertEquals(BookingRequestStatus.EXPIRED, request.getStatus());
    assertEquals(ChefScheduleStatus.CANCELLED, schedule.getStatus());
    assertEquals(BookingStatus.PENDING.name(), booking.getBookingStatus());
  }

  @Test
  void allowsNewRequestAfterPreviousHoldExpired() {
    Booking booking = booking(Instant.now().plus(Duration.ofHours(5)));
    booking.setBookingStatus(BookingStatus.PENDING_CHEF_ACCEPTANCE.name());
    BookingRequest oldRequest =
        BookingRequest.builder()
            .id(80L)
            .booking(booking)
            .chef(chef())
            .status(BookingRequestStatus.PENDING)
            .expiresAt(Instant.now().minusSeconds(1))
            .build();
    ChefSchedule oldSchedule = ChefSchedule.builder().status(ChefScheduleStatus.HELD).build();
    eligible(booking, chef());
    when(requests.findFirstByBooking_IdAndIsActiveTrueAndStatusInOrderByIdDesc(eq(1L), any()))
        .thenReturn(Optional.of(oldRequest));
    when(schedules.findByBooking_IdAndChef_IdAndStatus(1L, 12L, ChefScheduleStatus.HELD))
        .thenReturn(List.of(oldSchedule));
    when(profiles.findMatchedProfileDishIds(List.of(7L), List.of(10L, 20L)))
        .thenReturn(List.<Object[]>of(new Object[] {12L, 10L}));
    when(requests.saveAndFlush(any(BookingRequest.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    service.create(1L, 12L, 5L);

    assertEquals(BookingRequestStatus.EXPIRED, oldRequest.getStatus());
    assertEquals(ChefScheduleStatus.CANCELLED, oldSchedule.getStatus());
    assertEquals(BookingStatus.PENDING_CHEF_ACCEPTANCE.name(), booking.getBookingStatus());
    verify(schedules).save(any(ChefSchedule.class));
  }

  private void eligible(Booking booking, User chef) {
    when(bookings.lockOwnedBooking(1L, 5L)).thenReturn(Optional.of(booking));
    when(users.lockScheduleOwner(12L)).thenReturn(Optional.of(chef));
    when(profiles.findByUserId(12L)).thenReturn(Optional.of(profile()));
    when(profiles.hasActiveChefRole(12L)).thenReturn(true);
    when(profiles.countMatchingServiceAreas(7L, "P1", "W1")).thenReturn(1L);
  }

  private static Booking booking(Instant mealAt) {
    Booking booking =
        Booking.builder()
            .id(1L)
            .customer(User.builder().id(5L).build())
            .scheduledAt(mealAt)
            .provinceCode("P1")
            .wardCode("W1")
            .bookingStatus(BookingStatus.PENDING.name())
            .build();
    booking.addDish(
        BookingItemDish.builder().dish(Dish.builder().id(10L).build()).dishName("Dish A").build());
    booking.addDish(
        BookingItemDish.builder().dish(Dish.builder().id(20L).build()).dishName("Dish B").build());
    return booking;
  }

  private static User chef() {
    return User.builder().id(12L).build();
  }

  private static ChefProfile profile() {
    return ChefProfile.builder()
        .id(7L)
        .user(chef())
        .reviewStatus(ChefApplicationStatus.APPROVED)
        .build();
  }
}
