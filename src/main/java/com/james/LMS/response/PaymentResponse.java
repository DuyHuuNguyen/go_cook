package com.james.LMS.response;

import com.james.LMS.entity.Payment;
import com.james.LMS.enums.PaymentMethod;
import com.james.LMS.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PaymentResponse(
    Long id,
    Long bookingId,
    PaymentMethod paymentMethod,
    PaymentStatus status,
    BigDecimal amount,
    String transactionRef,
    String providerResponseCode,
    String vnpTransactionNo,
    String bankCode,
    OffsetDateTime paidAt,
    OffsetDateTime expiredAt) {
  public static PaymentResponse from(Payment payment) {
    return new PaymentResponse(payment.getId(), payment.getBooking().getId(),
        payment.getPaymentMethod(), payment.getStatus(), payment.getAmount(),
        payment.getTransactionRef(), payment.getProviderResponseCode(),
        payment.getVnpTransactionNo(), payment.getBankCode(), payment.getPaidAt(),
        payment.getExpiredAt());
  }
}
