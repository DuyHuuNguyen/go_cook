package com.james.LMS.service.impl;

import com.james.LMS.entity.Booking;
import com.james.LMS.entity.BookingRequest;
import com.james.LMS.entity.ChefSchedule;
import com.james.LMS.entity.Payment;
import com.james.LMS.enums.BookingRequestStatus;
import com.james.LMS.enums.BookingStatus;
import com.james.LMS.enums.ChefScheduleStatus;
import com.james.LMS.enums.ErrorCode;
import com.james.LMS.enums.PaymentMethod;
import com.james.LMS.enums.PaymentStatus;
import com.james.LMS.exception.BookingRequestException;
import com.james.LMS.exception.EntityNotFoundException;
import com.james.LMS.repository.BookingRepository;
import com.james.LMS.repository.BookingRequestRepository;
import com.james.LMS.repository.ChefScheduleRepository;
import com.james.LMS.repository.PaymentRepository;
import com.james.LMS.response.CreateVnpayPaymentResponse;
import com.james.LMS.response.PaymentResponse;
import com.james.LMS.response.PaymentResultResponse;
import com.james.LMS.response.VnpayIpnResponse;
import com.james.LMS.response.VnpayReturnResponse;
import com.james.LMS.service.PaymentService;
import com.james.LMS.service.VnpayGateway;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
  private static final List<BookingRequestStatus> PAYABLE_REQUEST_STATUSES =
      List.of(BookingRequestStatus.AWAITING_PAYMENT);
  private final PaymentRepository paymentRepository;
  private final BookingRepository bookingRepository;
  private final BookingRequestRepository bookingRequestRepository;
  private final ChefScheduleRepository chefScheduleRepository;
  private final VnpayGateway vnpayGateway;

  @Override
  @Transactional
  public CreateVnpayPaymentResponse createVnpay(Long bookingId, Long customerId, String ipAddress) {
    Booking booking =
        bookingRepository
            .lockOwnedBooking(bookingId, customerId)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.BOOKING_NOT_FOUND));
    BookingRequest request =
        bookingRequestRepository
            .findFirstByBooking_IdAndIsActiveTrueAndStatusInOrderByIdDesc(
                bookingId, PAYABLE_REQUEST_STATUSES)
            .orElseThrow(
                () ->
                    conflict(
                        "BOOKING_NOT_ACCEPTED",
                        "Booking is not awaiting payment after chef acceptance"));
    if (request.getExpiresAt() == null || !request.getExpiresAt().isAfter(Instant.now())) {
      throw conflict("PAYMENT_WINDOW_EXPIRED", "Booking payment window has expired");
    }
    BigDecimal amount = booking.getTotalAmount();
    if (amount == null || amount.signum() <= 0 || amount.stripTrailingZeros().scale() > 0) {
      throw new BookingRequestException(
          HttpStatus.UNPROCESSABLE_ENTITY,
          "BOOKING_PRICE_NOT_FINAL",
          "Booking totalAmount must be a positive whole VND amount");
    }
    for (Payment previous :
        paymentRepository.findByBooking_IdAndIsActiveTrueOrderByIdDesc(bookingId)) {
      if (previous.getStatus() == PaymentStatus.SUCCESS) {
        throw conflict("BOOKING_ALREADY_PAID", "Booking has already been paid");
      }
      if (previous.getStatus() == PaymentStatus.PENDING) {
        throw conflict("PAYMENT_PENDING", "Booking already has a pending payment");
      }
    }

    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    OffsetDateTime expiresAt = now.plusMinutes(15);
    OffsetDateTime requestExpiry = request.getExpiresAt().atOffset(ZoneOffset.UTC);
    if (requestExpiry.isBefore(expiresAt)) expiresAt = requestExpiry;

    if (!expiresAt.isAfter(now)) {
      throw conflict("PAYMENT_WINDOW_EXPIRED", "Booking payment window has expired");
    }

    Payment payment = new Payment();
    payment.setBooking(booking);
    payment.setPaymentMethod(PaymentMethod.VNPAY);
    payment.setTransactionRef(UUID.randomUUID().toString().replace("-", ""));
    payment.setAmount(amount);
    payment.setStatus(PaymentStatus.PENDING);
    payment.setExpiredAt(expiresAt);
    String url =
        vnpayGateway.paymentUrl(
            payment.getTransactionRef(),
            amount,
            "Payment for booking " + booking.getBookingCode(),
            ipAddress,
            now,
            expiresAt);
    paymentRepository.saveAndFlush(payment);
    return new CreateVnpayPaymentResponse(PaymentResponse.from(payment), url);
  }

  @Override
  @Transactional(readOnly = true)
  public PaymentResponse findOwnedPayment(Long paymentId, Long customerId) {
    Payment payment =
        paymentRepository
            .findByIdAndBooking_Customer_IdAndIsActiveTrue(paymentId, customerId)
            .orElseThrow(() -> notFound());
    return PaymentResponse.from(payment);
  }

  @Override
  @Transactional(readOnly = true)
  public PaymentResultResponse findOwnedPaymentResult(Long bookingId, Long customerId) {
    Payment payment =
        paymentRepository
            .findFirstByBooking_IdAndBooking_Customer_IdAndIsActiveTrueOrderByIdDesc(
                bookingId, customerId)
            .orElseThrow(() -> notFound());
    return PaymentResultResponse.from(payment);
  }

  @Override
  @Transactional
  public VnpayIpnResponse processVnpayIpn(Map<String, String> parameters) {
    if (!vnpayGateway.validSignature(parameters) || !vnpayGateway.validMerchant(parameters)) {
      return new VnpayIpnResponse("97", "Invalid checksum");
    }
    String transactionRef = parameters.get("vnp_TxnRef");
    Payment payment =
        transactionRef == null
            ? null
            : paymentRepository.lockByTransactionRef(transactionRef).orElse(null);
    if (payment == null) return new VnpayIpnResponse("01", "Order not found");
    if (!validAmount(payment, parameters.get("vnp_Amount"))) {
      return new VnpayIpnResponse("04", "Invalid amount");
    }
    if (payment.getStatus() != PaymentStatus.PENDING) {
      return new VnpayIpnResponse("02", "Order already confirmed");
    }
    String responseCode = parameters.get("vnp_ResponseCode");
    String transactionStatus = parameters.get("vnp_TransactionStatus");
    if (responseCode == null || transactionStatus == null) {
      return new VnpayIpnResponse("97", "Missing transaction result");
    }
    if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
      Booking booking = bookingRepository.lockById(payment.getBooking().getId()).orElse(null);
      if (booking == null) return new VnpayIpnResponse("01", "Order not found");
      BookingRequest request =
          bookingRequestRepository
              .findFirstByBooking_IdAndIsActiveTrueAndStatusInOrderByIdDesc(
                  booking.getId(), PAYABLE_REQUEST_STATUSES)
              .orElse(null);
      if (request == null) {
        return new VnpayIpnResponse("99", "Accepted chef request is unavailable");
      }
      List<ChefSchedule> schedules =
          chefScheduleRepository.findByBooking_IdAndChef_IdAndStatus(
              booking.getId(), request.getChef().getId(), ChefScheduleStatus.HELD);
      if (schedules.size() != 1) {
        return new VnpayIpnResponse("99", "Chef schedule is unavailable");
      }
      ChefSchedule schedule = schedules.get(0);
      schedule.setStatus(ChefScheduleStatus.CONFIRMED);
      schedule.setHoldExpiresAt(null);
      booking.setBookingStatus(BookingStatus.PAID.name());
      payment.setStatus(PaymentStatus.SUCCESS);
      payment.setPaidAt(OffsetDateTime.now(ZoneOffset.UTC));

    } else if ("24".equals(responseCode)) {
      payment.setStatus(PaymentStatus.CANCELLED);
    } else {
      payment.setStatus(PaymentStatus.FAILED);
    }

    payment.setProviderResponseCode(responseCode);
    payment.setVnpTransactionNo(parameters.get("vnp_TransactionNo"));
    payment.setBankCode(parameters.get("vnp_BankCode"));
    return new VnpayIpnResponse("00", "Confirm success");
  }

  @Override
  @Transactional(readOnly = true)
  public VnpayReturnResponse processVnpayReturn(Map<String, String> parameters) {
    if (!vnpayGateway.validSignature(parameters) || !vnpayGateway.validMerchant(parameters)) {
      throw new BookingRequestException(
          HttpStatus.BAD_REQUEST, "VNPAY_INVALID_SIGNATURE", "Invalid VNPay return signature");
    }
    Payment payment =
        paymentRepository
            .findByTransactionRefAndIsActiveTrue(parameters.get("vnp_TxnRef"))
            .orElseThrow(() -> notFound());
    if (!validAmount(payment, parameters.get("vnp_Amount"))) {
      throw new BookingRequestException(
          HttpStatus.BAD_REQUEST,
          "VNPAY_INVALID_AMOUNT",
          "VNPay return amount does not match the payment");
    }
    return new VnpayReturnResponse(
        payment.getId(),
        payment.getBooking().getId(),
        payment.getStatus(),
        parameters.get("vnp_ResponseCode"),
        true);
  }

  private static boolean validAmount(Payment payment, String vnpAmount) {
    return vnpAmount != null
        && payment.getAmount().movePointRight(2).toBigIntegerExact().toString().equals(vnpAmount);
  }

  private static BookingRequestException conflict(String code, String message) {
    return new BookingRequestException(HttpStatus.CONFLICT, code, message);
  }

  private static BookingRequestException notFound() {
    return new BookingRequestException(
        HttpStatus.NOT_FOUND, "PAYMENT_NOT_FOUND", "Payment not found");
  }
}
