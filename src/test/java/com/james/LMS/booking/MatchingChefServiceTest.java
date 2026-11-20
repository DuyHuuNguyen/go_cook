package com.james.LMS.booking;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.james.LMS.config.ChefBookingProperties;
import com.james.LMS.entity.Booking;
import com.james.LMS.entity.BookingItemDish;
import com.james.LMS.entity.ChefProfile;
import com.james.LMS.entity.Dish;
import com.james.LMS.entity.User;
import com.james.LMS.enums.ChefApplicationStatus;
import com.james.LMS.enums.ChefScheduleStatus;
import com.james.LMS.exception.EntityNotFoundException;
import com.james.LMS.repository.BookingRepository;
import com.james.LMS.repository.ChefProfileRepository;
import com.james.LMS.repository.ChefScheduleRepository;
import com.james.LMS.repository.DishRepository;
import com.james.LMS.response.MatchingChefResponse;
import com.james.LMS.response.MatchingChefsResponse;
import com.james.LMS.service.DishService;
import com.james.LMS.service.UserService;
import com.james.LMS.service.impl.BookingServiceImpl;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MatchingChefServiceTest {
  @Mock BookingRepository bookings;
  @Mock ChefProfileRepository profiles;
  @Mock ChefScheduleRepository schedules;
  @Mock DishRepository dishes;
  @Mock DishService dishService;
  @Mock UserService userService;
  @Mock ChefBookingProperties chefBookingProperties;
  @InjectMocks BookingServiceImpl service;

  @Test
  void returnsPartialMatchOnceAndExcludesBusyChef() {
    Instant time = Instant.now().plusSeconds(86400);
    Booking booking =
        Booking.builder().id(1L).provinceCode("P1").wardCode("W1").scheduledAt(time).build();
    booking.addDish(
        BookingItemDish.builder().dish(Dish.builder().id(10L).build()).dishName("Dish A").build());
    booking.addDish(
        BookingItemDish.builder().dish(Dish.builder().id(20L).build()).dishName("Dish B").build());
    ChefProfile available = profile(100L, 12L, "Chef A");
    ChefProfile busy = profile(200L, 13L, "Chef B");

    when(bookings.findByIdAndCustomer_IdAndIsActiveTrue(1L, 5L)).thenReturn(Optional.of(booking));
    when(chefBookingProperties.getPreparationDuration()).thenReturn(java.time.Duration.ofHours(2));
    when(profiles.findMatchingAreaChefs("P1", "W1", ChefApplicationStatus.APPROVED))
        .thenReturn(List.of(available, available, busy));
    when(profiles.findMatchedProfileDishIds(List.of(100L, 100L, 200L), List.of(10L, 20L)))
        .thenReturn(List.<Object[]>of(new Object[] {12L, 10L}, new Object[] {13L, 20L}));
    when(dishes.findOwnedDishChefIds(List.of(10L, 20L)))
        .thenReturn(List.<Object[]>of(new Object[] {12L, 10L}));
    when(schedules.findBusyChefIdsDuring(
            eq(List.of(12L, 12L, 13L)),
            eq(time.minusSeconds(7200)),
            eq(time),
            any(),
            eq(ChefScheduleStatus.CONFIRMED),
            eq(ChefScheduleStatus.HELD)))
        .thenReturn(List.of(13L));

    var result = service.findMatchingChefs(1L, 5L);

    assertEquals(1, result.size());
    assertEquals(12L, result.getFirst().chefId());
    assertEquals("Chef A", result.getFirst().fullName());
    assertEquals("5", result.getFirst().experienceYears());
    assertEquals(1, result.getFirst().matchedDishCount());
    assertEquals(2, result.getFirst().totalRequestedDishCount());
    assertEquals(10L, result.getFirst().matchedDishes().getFirst().dishId());
    assertEquals(20L, result.getFirst().unmatchedDishes().getFirst().dishId());
  }

  @Test
  void concealsBookingsNotOwnedByCustomer() {
    when(bookings.findByIdAndCustomer_IdAndIsActiveTrue(1L, 5L)).thenReturn(Optional.empty());

    assertThrows(EntityNotFoundException.class, () -> service.findMatchingChefs(1L, 5L));
    verify(bookings).findByIdAndCustomer_IdAndIsActiveTrue(1L, 5L);
  }

  @Test
  void responseUsesRequestedSuccessAndExperienceFieldNames() throws Exception {
    String json =
        new ObjectMapper()
            .writeValueAsString(
                new MatchingChefsResponse(
                    true,
                    List.of(
                        new MatchingChefResponse(
                            12L,
                            "Chef A",
                            "bio",
                            "5",
                            "avatar",
                            1,
                            1,
                            List.of(new MatchingChefResponse.DishItem(10L, "Dish A")),
                            List.of()))));
    assertTrue(json.contains("\"isSuccess\":true"));
    assertTrue(json.contains("\"experience_years\":\"5\""));
    assertTrue(json.contains("\"chefId\":12"));
  }

  private static ChefProfile profile(Long profileId, Long chefId, String name) {
    return ChefProfile.builder()
        .id(profileId)
        .user(User.builder().id(chefId).username(name).avatarUrl("avatar").build())
        .bio("bio")
        .experienceYears(5)
        .build();
  }
}
