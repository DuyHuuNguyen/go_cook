package com.james.LMS.service.impl;

import com.james.LMS.config.ChefBookingProperties;
import com.james.LMS.entity.Booking;
import com.james.LMS.entity.BookingRequest;
import com.james.LMS.entity.ChefProfile;
import com.james.LMS.entity.ChefSchedule;
import com.james.LMS.entity.User;
import com.james.LMS.enums.BookingRequestStatus;
import com.james.LMS.enums.BookingStatus;
import com.james.LMS.enums.ChefApplicationStatus;
import com.james.LMS.enums.ChefScheduleStatus;
import com.james.LMS.enums.ErrorCode;
import com.james.LMS.exception.BookingRequestException;
import com.james.LMS.exception.EntityNotFoundException;
import com.james.LMS.repository.BookingRepository;
import com.james.LMS.repository.BookingRequestRepository;
import com.james.LMS.repository.ChefProfileRepository;
import com.james.LMS.repository.ChefScheduleRepository;
import com.james.LMS.repository.DishRepository;
import com.james.LMS.repository.UserRepository;
import com.james.LMS.response.BookingChefRequestResponse;
import com.james.LMS.service.BookingRequestService;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingRequestServiceImpl implements BookingRequestService {
  private final BookingRequestRepository bookingRequestRepository;
  private final BookingRepository bookingRepository;
  private final UserRepository userRepository;
  private final ChefProfileRepository chefProfileRepository;
  private final DishRepository dishRepository;
  private final ChefScheduleRepository chefScheduleRepository;
  private final ChefBookingProperties properties;

  private static final List<BookingRequestStatus> HOLDING_STATUSES =
      List.of(
          BookingRequestStatus.PENDING,
          BookingRequestStatus.ACCEPTED,
          BookingRequestStatus.AWAITING_PAYMENT);

  @Override
  @Transactional
  public BookingChefRequestResponse create(Long bookingId, Long chefId, Long customerId) {

    Booking booking =
        bookingRepository
            .lockOwnedBooking(bookingId, customerId)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.BOOKING_NOT_FOUND));
    Instant now = Instant.now();
    var currentRequest =
        bookingRequestRepository.findFirstByBooking_IdAndIsActiveTrueAndStatusInOrderByIdDesc(
            bookingId, HOLDING_STATUSES);
    if (currentRequest.isPresent()) {
      BookingRequest existing = currentRequest.get();
      if (existing.getExpiresAt() == null || existing.getExpiresAt().isAfter(now)) {
        throw conflict("BOOKING_REQUEST_EXISTS", "Booking already has an active chef request");
      }
      expire(existing, booking);
    }
    if (!BookingStatus.PENDING.name().equals(booking.getBookingStatus())
        || booking.getChef() != null) {
      throw conflict(
          "BOOKING_NOT_SELECTABLE", "Booking cannot select a chef in its current status");
    }

    if (!properties.getPreparationDuration().isPositive()
        || !properties.holdFor(BookingRequestStatus.PENDING).isPositive()) {
      throw new BookingRequestException(
          HttpStatus.UNPROCESSABLE_ENTITY,
          "BOOKING_TIME_INVALID",
          "Chef booking durations must be positive");
    }

    User chef =
        userRepository
            .lockScheduleOwner(chefId)
            .orElseThrow(
                () ->
                    new BookingRequestException(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        "CHEF_UNAVAILABLE",
                        "Chef is not active or does not exist"));
    ChefProfile profile =
        chefProfileRepository
            .findByUserId(chefId)
            .orElseThrow(
                () ->
                    new BookingRequestException(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        "CHEF_UNAVAILABLE",
                        "Chef is not approved"));
    if (!profile.isActive()
        || profile.getReviewStatus() != ChefApplicationStatus.APPROVED
        || !chefProfileRepository.hasActiveChefRole(chefId)) {
      throw new BookingRequestException(
          HttpStatus.UNPROCESSABLE_ENTITY,
          "CHEF_UNAVAILABLE",
          "Chef is not eligible to receive bookings");
    }
    if (booking.getProvinceCode() == null
        || chefProfileRepository.countMatchingServiceAreas(
                profile.getId(), booking.getProvinceCode(), booking.getWardCode())
            == 0) {
      throw new BookingRequestException(
          HttpStatus.UNPROCESSABLE_ENTITY,
          "CHEF_AREA_MISMATCH",
          "Chef does not serve the booking area");
    }

    List<Long> dishIds =
        booking.getDishes().stream().map(item -> item.getDish().getId()).distinct().toList();
    boolean canCook =
        !dishIds.isEmpty()
            && (!chefProfileRepository
                    .findMatchedProfileDishIds(List.of(profile.getId()), dishIds)
                    .isEmpty()
                || dishRepository.findOwnedDishChefIds(dishIds).stream()
                    .anyMatch(pair -> chefId.equals(pair[0])));
    if (!canCook) {
      throw new BookingRequestException(
          HttpStatus.UNPROCESSABLE_ENTITY,
          "CHEF_DISH_MISMATCH",
          "Chef cannot cook any requested dish");
    }

    // Refresh the clock after waiting on the chef lock.
    now = Instant.now();
    Instant endAt = booking.getScheduledAt();
    Instant startAt = endAt.minus(properties.getPreparationDuration());
    if (!startAt.isAfter(now)) {
      throw new BookingRequestException(
          HttpStatus.UNPROCESSABLE_ENTITY,
          "BOOKING_TIME_INVALID",
          "Booking must allow the full chef preparation time");
    }

    if (chefScheduleRepository.countBlockingOverlaps(
            chefId, startAt, endAt, now, ChefScheduleStatus.CONFIRMED, ChefScheduleStatus.HELD)
        > 0) {
      throw conflict("CHEF_SCHEDULE_CONFLICT", "Chef has a conflicting schedule");
    }

    Instant expiresAt = now.plus(properties.holdFor(BookingRequestStatus.PENDING));
    BookingRequest request =
        bookingRequestRepository.saveAndFlush(
            BookingRequest.builder()
                .booking(booking)
                .chef(chef)
                .status(BookingRequestStatus.PENDING)
                .expiresAt(expiresAt)
                .build());
    chefScheduleRepository.save(
        ChefSchedule.builder()
            .booking(booking)
            .chef(chef)
            .startAt(startAt)
            .endAt(endAt)
            .status(ChefScheduleStatus.HELD)
            .holdExpiresAt(expiresAt)
            .build());
    booking.setBookingStatus(BookingStatus.PENDING_CHEF_ACCEPTANCE.name());
    bookingRepository.save(booking);
    return BookingChefRequestResponse.from(request, startAt, endAt);
  }

  @Override
  @Transactional
  public void expireDueRequest(Long requestId) {
    Long bookingId = bookingRequestRepository.findBookingIdById(requestId).orElse(null);
    if (bookingId == null) return;
    Booking booking = bookingRepository.lockById(bookingId).orElse(null);
    if (booking == null) return;
    if (BookingStatus.PAID.name().equals(booking.getBookingStatus())) return;
    bookingRequestRepository
        .findById(requestId)
        .ifPresent(
            request -> {
              Instant now = Instant.now();
              if (HOLDING_STATUSES.contains(request.getStatus())
                  && request.getExpiresAt() != null
                  && !request.getExpiresAt().isAfter(now)) {
                expire(request, booking);
              }
            });
  }

  private void expire(BookingRequest request, Booking booking) {
    request.setStatus(BookingRequestStatus.EXPIRED);
    for (ChefSchedule schedule :
        chefScheduleRepository.findByBooking_IdAndChef_IdAndStatus(
            booking.getId(), request.getChef().getId(), ChefScheduleStatus.HELD)) {
      schedule.setStatus(ChefScheduleStatus.CANCELLED);
      schedule.setHoldExpiresAt(null);
    }
    if (BookingStatus.PENDING_CHEF_ACCEPTANCE.name().equals(booking.getBookingStatus())) {
      booking.setBookingStatus(BookingStatus.PENDING.name());
    }
  }

  private static BookingRequestException conflict(String code, String message) {
    return new BookingRequestException(HttpStatus.CONFLICT, code, message);
  }
}
