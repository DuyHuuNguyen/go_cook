package com.james.LMS.response;

import com.james.LMS.entity.BookingRequest;
import java.time.Instant;

public record BookingChefRequestResponse(
    Long requestId,
    Long bookingId,
    Long chefId,
    String requestStatus,
    String bookingStatus,
    Instant expiresAt,
    Instant scheduleStartAt,
    Instant scheduleEndAt) {
  public static BookingChefRequestResponse from(
      BookingRequest request, Instant scheduleStartAt, Instant scheduleEndAt) {
    return new BookingChefRequestResponse(
        request.getId(),
        request.getBooking().getId(),
        request.getChef().getId(),
        request.getStatus().name(),
        request.getBooking().getBookingStatus(),
        request.getExpiresAt(),
        scheduleStartAt,
        scheduleEndAt);
  }
}
