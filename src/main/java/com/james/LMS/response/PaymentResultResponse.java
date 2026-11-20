package com.james.LMS.response;

import com.james.LMS.entity.Payment;
import com.james.LMS.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PaymentResultResponse(
    Long paymentId,
    Long bookingId,
    PaymentStatus status,
    BigDecimal amount,
    String transactionId,
    OffsetDateTime paidAt,
    String message) {
  public static PaymentResultResponse from(Payment payment) {
    String message =
        payment.getStatus() == PaymentStatus.SUCCESS
            ? "Thanh toán thành công"
            : payment.getStatus() == PaymentStatus.PENDING
                ? "Giao dịch đang được xử lý"
                : "Thanh toán không thành công";
    return new PaymentResultResponse(
        payment.getId(),
        payment.getBooking().getId(),
        payment.getStatus(),
        payment.getAmount(),
        payment.getTransactionRef(),
        payment.getPaidAt(),
        message);
  }
}
