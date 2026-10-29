package com.james.LMS.response;

import com.james.LMS.entity.Booking;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record BookingResponse(
    Long id,
    String bookingCode,
    Long customerId,
    Long chefId,
    Instant scheduledAt,
    String serviceAddress,
    String customerNote,
    Integer guestCount,
    BigDecimal totalAmount,
    String bookingStatus,
    Long createdAt,
    List<DishItem> dishes) {
  public static BookingResponse from(Booking booking) {
    return new BookingResponse(
        booking.getId(),
        booking.getBookingCode(),
        booking.getCustomer().getId(),
        booking.getChef() == null ? null : booking.getChef().getId(),
        booking.getScheduledAt(),
        booking.getServiceAddress(),
        booking.getCustomerNote(),
        booking.getGuestCount(),
        booking.getTotalAmount(),
        booking.getBookingStatus(),
        booking.getCreatedAt(),
        booking.getDishes().stream()
            .map(
                item ->
                    new DishItem(
                        item.getDish().getId(),
                        item.getDishName(),
                        item.getQuantity(),
                        item.getUnitPrice()))
            .toList());
  }

  public record DishItem(Long dishId, String dishName, Integer quantity, BigDecimal unitPrice) {}
}
