package com.james.LMS.response;

import com.james.LMS.entity.Booking;
import com.james.LMS.entity.ChefProfile;
import com.james.LMS.entity.Payment;
import com.james.LMS.entity.User;
import com.james.LMS.enums.PaymentMethod;
import com.james.LMS.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

public record BookingDetailResponse(
    BookingInformation bookingInformation,
    ChefInformation chefInformation,
    MenuInformation menuInformation,
    PaymentInformation paymentInformation) {

  public static BookingDetailResponse from(Booking booking, Payment payment) {
    User chef = booking.getChef();
    ChefProfile chefProfile = chef == null ? null : chef.getChefProfile();

    return new BookingDetailResponse(
        new BookingInformation(
            booking.getId(),
            booking.getBookingStatus(),
            booking.getScheduledAt(),
            booking.getServiceAddress(),
            booking.getGuestCount(),
            booking.getCustomerNote(),
            booking.getTotalAmount()),
        chef == null
            ? null
            : new ChefInformation(
                chef.getId(),
                chef.getUsername(),
                chef.getAvatarUrl(),
                chefProfile == null ? null : chefProfile.getBio(),
                chefProfile == null ? null : chefProfile.getExperienceYears()),
        new MenuInformation(
            booking.getDishes().stream()
                .map(
                    item ->
                        new DishInformation(
                            item.getDish().getId(), item.getDishName(), null, item.getQuantity()))
                .toList()),
        payment == null
            ? new PaymentInformation(
                null,
                PaymentMethod.VNPAY,
                null,
                booking.getTotalAmount(),
                null,
                null,
                null,
                null,
                null,
                null)
            : new PaymentInformation(
                payment.getId(),
                payment.getPaymentMethod(),
                payment.getStatus(),
                payment.getAmount(),
                payment.getTransactionRef(),
                payment.getProviderResponseCode(),
                payment.getVnpTransactionNo(),
                payment.getBankCode(),
                payment.getPaidAt(),
                payment.getExpiredAt()));
  }

  public record BookingInformation(
      Long bookingId,
      String bookingStatus,
      Instant scheduledDateTime,
      String serviceAddress,
      Integer guestCount,
      String customerNote,
      BigDecimal totalAmount) {}

  public record ChefInformation(
      Long chefId, String chefName, String chefAvatar, String bio, Integer experienceYears) {}

  public record MenuInformation(List<DishInformation> dishes) {}

  public record DishInformation(
      Long dishId, String dishName, String dishImageUrl, Integer quantity) {}

  public record PaymentInformation(
      Long paymentId,
      PaymentMethod paymentMethod,
      PaymentStatus status,
      BigDecimal amount,
      String transactionRef,
      String providerResponseCode,
      String vnpTransactionNo,
      String bankCode,
      OffsetDateTime paidAt,
      OffsetDateTime expiredAt) {}
}
