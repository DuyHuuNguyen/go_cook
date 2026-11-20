package com.james.LMS.entity;

import com.james.LMS.enums.PaymentMethod;
import com.james.LMS.enums.PaymentStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.*;

@Entity
@Table(
    name = "payments",
    uniqueConstraints = {
      @UniqueConstraint(name = "uk_payments_transaction_ref", columnNames = "transaction_ref")
    })
@Getter
@Setter
@NoArgsConstructor
public class Payment extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "booking_id", nullable = false)
  private Booking booking;

  @Enumerated(EnumType.STRING)
  @Column(name = "payment_method", nullable = false, length = 30)
  private PaymentMethod paymentMethod;

  @Column(name = "transaction_ref", nullable = false, unique = true, length = 150)
  private String transactionRef;

  @Column(name = "amount", nullable = false, precision = 12, scale = 2)
  private BigDecimal amount;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 30)
  private PaymentStatus status;

  @Column(name = "vnp_transaction_no", length = 100)
  private String vnpTransactionNo;

  @Column(name = "bank_code", length = 50)
  private String bankCode;

  @Column(name = "provider_response_code", length = 100)
  private String providerResponseCode;

  @Column(name = "paid_at")
  private OffsetDateTime paidAt;

  @Column(name = "expired_at")
  private OffsetDateTime expiredAt;
}
