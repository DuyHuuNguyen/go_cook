package com.james.LMS.response;

import com.james.LMS.entity.ChefSchedule;
import com.james.LMS.enums.ChefScheduleStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;

@Builder
public record ChefWeeklyScheduleResponse(
    LocalDate startDate,
    LocalDate endDate,
    LocalDate prevWeekStartDate,
    LocalDate nextWeekStartDate,
    int weekOfYear,
    int year,
    String displayRange,
    List<ChefScheduleDayResponse> days,
    List<ChefScheduleItemResponse> allSchedules) {

  @Builder
  public record ChefScheduleDayResponse(
      LocalDate date,
      String dayOfWeek,
      String displayDate,
      boolean isToday,
      int scheduleCount,
      List<ChefScheduleItemResponse> items) {}

  @Builder
  public record ChefScheduleItemResponse(
      Long id,
      Long bookingId,
      String bookingCode,
      Long customerId,
      String customerName,
      String customerPhone,
      String serviceAddress,
      Instant startAt,
      Instant endAt,
      ChefScheduleStatus status,
      Instant holdExpiresAt,
      Integer guestCount,
      BigDecimal totalAmount,
      List<String> dishes) {

    public static ChefScheduleItemResponse from(ChefSchedule s) {
      var booking = s.getBooking();
      var customer = booking != null ? booking.getCustomer() : null;
      List<String> dishNames =
          booking != null && booking.getDishes() != null
              ? booking.getDishes().stream().map(d -> d.getDishName()).toList()
              : List.of();

      return ChefScheduleItemResponse.builder()
          .id(s.getId())
          .bookingId(booking != null ? booking.getId() : null)
          .bookingCode(booking != null ? booking.getBookingCode() : null)
          .customerId(customer != null ? customer.getId() : null)
          .customerName(customer != null ? customer.getUsername() : null)
          .customerPhone(customer != null ? customer.getPhone() : null)
          .serviceAddress(booking != null ? booking.getServiceAddress() : null)
          .startAt(s.getStartAt())
          .endAt(s.getEndAt())
          .status(s.getStatus())
          .holdExpiresAt(s.getHoldExpiresAt())
          .guestCount(booking != null ? booking.getGuestCount() : null)
          .totalAmount(booking != null ? booking.getTotalAmount() : null)
          .dishes(dishNames)
          .build();
    }
  }
}

