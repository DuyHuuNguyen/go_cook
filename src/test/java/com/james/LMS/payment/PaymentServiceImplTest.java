package com.james.LMS.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.james.LMS.entity.Booking;
import com.james.LMS.entity.BookingRequest;
import com.james.LMS.entity.ChefSchedule;
import com.james.LMS.entity.Payment;
import com.james.LMS.entity.User;
import com.james.LMS.enums.BookingRequestStatus;
import com.james.LMS.enums.BookingStatus;
import com.james.LMS.enums.ChefScheduleStatus;
import com.james.LMS.enums.PaymentStatus;
import com.james.LMS.exception.BookingRequestException;
import com.james.LMS.repository.BookingRepository;
import com.james.LMS.repository.BookingRequestRepository;
import com.james.LMS.repository.ChefScheduleRepository;
import com.james.LMS.repository.PaymentRepository;
import com.james.LMS.service.VnpayGateway;
import com.james.LMS.service.impl.PaymentServiceImpl;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {
  @Mock PaymentRepository paymentRepository;
  @Mock BookingRepository bookingRepository;
  @Mock BookingRequestRepository bookingRequestRepository;
  @Mock ChefScheduleRepository chefScheduleRepository;
  @Mock VnpayGateway gateway;
  PaymentServiceImpl service;

  @BeforeEach
  void setUp() {
    service =
        new PaymentServiceImpl(
            paymentRepository,
            bookingRepository,
            bookingRequestRepository,
            chefScheduleRepository,
            gateway);
  }

  @Test
  void createRequiresChefAcceptanceAndFinalAmount() {
    Booking booking =
        Booking.builder()
            .customer(new User())
            .bookingCode("BK-1")
            .totalAmount(new BigDecimal("10000.00"))
            .build();
    when(bookingRepository.lockOwnedBooking(1L, 7L)).thenReturn(Optional.of(booking));
    when(bookingRequestRepository.findFirstByBooking_IdAndIsActiveTrueAndStatusInOrderByIdDesc(
            1L, List.of(BookingRequestStatus.AWAITING_PAYMENT)))
        .thenReturn(Optional.empty());

    BookingRequestException exception =
        assertThrows(BookingRequestException.class, () -> service.createVnpay(1L, 7L, "127.0.0.1"));
    assertEquals("BOOKING_NOT_ACCEPTED", exception.getErrorCode());
  }

  @Test
  void createUsesBookingTotalAmount() {
    Booking booking =
        Booking.builder()
            .customer(new User())
            .bookingCode("BK-1")
            .totalAmount(new BigDecimal("10000.00"))
            .build();
    BookingRequest request =
        BookingRequest.builder()
            .status(BookingRequestStatus.AWAITING_PAYMENT)
            .expiresAt(Instant.now().plusSeconds(1200))
            .build();
    when(bookingRepository.lockOwnedBooking(1L, 7L)).thenReturn(Optional.of(booking));
    when(bookingRequestRepository.findFirstByBooking_IdAndIsActiveTrueAndStatusInOrderByIdDesc(
            1L, List.of(BookingRequestStatus.AWAITING_PAYMENT)))
        .thenReturn(Optional.of(request));
    when(paymentRepository.findByBooking_IdAndIsActiveTrueOrderByIdDesc(1L)).thenReturn(List.of());
    when(gateway.paymentUrl(any(), eq(new BigDecimal("10000.00")), any(), any(), any(), any()))
        .thenReturn("https://sandbox.vnpayment.vn/pay");
    when(paymentRepository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

    assertEquals(
        "https://sandbox.vnpayment.vn/pay", service.createVnpay(1L, 7L, "127.0.0.1").paymentUrl());
    verify(gateway)
        .paymentUrl(any(), eq(new BigDecimal("10000.00")), any(), eq("127.0.0.1"), any(), any());
  }

  @Test
  void ipnValidatesAmountAndOnlySettlesOnce() {
    Payment payment = new Payment();
    Booking booking = Booking.builder().bookingStatus("PENDING_CHEF_ACCEPTANCE").build();
    payment.setBooking(booking);
    payment.setAmount(new BigDecimal("10000.00"));
    payment.setStatus(PaymentStatus.PENDING);
    BookingRequest request = BookingRequest.builder().chef(new User()).build();
    ChefSchedule schedule = ChefSchedule.builder().status(ChefScheduleStatus.HELD).build();
    when(gateway.validSignature(any())).thenReturn(true);
    when(gateway.validMerchant(any())).thenReturn(true);
    when(paymentRepository.lockByTransactionRef("ref123")).thenReturn(Optional.of(payment));
    when(bookingRepository.lockById(booking.getId())).thenReturn(Optional.of(booking));
    when(bookingRequestRepository.findFirstByBooking_IdAndIsActiveTrueAndStatusInOrderByIdDesc(
            booking.getId(), List.of(BookingRequestStatus.AWAITING_PAYMENT)))
        .thenReturn(Optional.of(request));
    when(chefScheduleRepository.findByBooking_IdAndChef_IdAndStatus(
            booking.getId(), request.getChef().getId(), ChefScheduleStatus.HELD))
        .thenReturn(List.of(schedule));
    Map<String, String> parameters =
        Map.of(
            "vnp_TxnRef",
            "ref123",
            "vnp_Amount",
            "1000000",
            "vnp_ResponseCode",
            "00",
            "vnp_TransactionStatus",
            "00");

    assertEquals("00", service.processVnpayIpn(parameters).responseCode());
    assertEquals(PaymentStatus.SUCCESS, payment.getStatus());
    assertEquals(BookingStatus.PAID.name(), booking.getBookingStatus());
    assertEquals(ChefScheduleStatus.CONFIRMED, schedule.getStatus());
    assertEquals("02", service.processVnpayIpn(parameters).responseCode());
    assertEquals(
        "04",
        service
            .processVnpayIpn(Map.of("vnp_TxnRef", "ref123", "vnp_Amount", "2000000"))
            .responseCode());
  }

  @Test
  void returnValidatesPaymentAndIncludesBookingIdForFrontendRedirect() {
    Booking booking = Booking.builder().id(42L).build();
    Payment payment = new Payment();
    payment.setBooking(booking);
    payment.setAmount(new BigDecimal("1200000.00"));
    payment.setStatus(PaymentStatus.PENDING);
    when(gateway.validSignature(any())).thenReturn(true);
    when(gateway.validMerchant(any())).thenReturn(true);
    when(paymentRepository.findByTransactionRefAndIsActiveTrue("ref123"))
        .thenReturn(Optional.of(payment));

    var result =
        service.processVnpayReturn(
            Map.of(
                "vnp_TxnRef", "ref123",
                "vnp_Amount", "120000000",
                "vnp_ResponseCode", "00"));

    assertEquals(42L, result.bookingId());
    assertEquals(PaymentStatus.PENDING, result.status());
    assertEquals("00", result.vnpResponseCode());
    assertEquals(true, result.verified());
  }

  @Test
  void findPaymentResultIsScopedToBookingCustomer() {
    Booking booking = Booking.builder().id(42L).build();
    Payment payment = new Payment();
    payment.setBooking(booking);
    payment.setAmount(new BigDecimal("1200000.00"));
    payment.setStatus(PaymentStatus.SUCCESS);
    payment.setTransactionRef("ref123");
    when(paymentRepository
            .findFirstByBooking_IdAndBooking_Customer_IdAndIsActiveTrueOrderByIdDesc(42L, 7L))
        .thenReturn(Optional.of(payment));

    var result = service.findOwnedPaymentResult(42L, 7L);

    assertEquals(42L, result.bookingId());
    assertEquals(PaymentStatus.SUCCESS, result.status());
    assertEquals(new BigDecimal("1200000.00"), result.amount());
    assertEquals("ref123", result.transactionId());
  }
}
