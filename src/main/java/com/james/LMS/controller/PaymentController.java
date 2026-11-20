package com.james.LMS.controller;

import com.james.LMS.config.SecurityConfig;
import com.james.LMS.exception.BookingRequestException;
import com.james.LMS.facade.PaymentFacade;
import com.james.LMS.request.CreateVnpayPaymentRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.CreateVnpayPaymentResponse;
import com.james.LMS.response.PaymentResponse;
import com.james.LMS.response.PaymentResultResponse;
import com.james.LMS.response.VnpayIpnResponse;
import com.james.LMS.response.VnpayReturnResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {
  private final PaymentFacade paymentFacade;

  @PostMapping("/vnpay")
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(
      summary = "Create a VNPay payment for an accepted booking",
      tags = {"Payment APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasAnyRole('USER', 'SYSTEM_ADMIN')")
  public BaseResponse<CreateVnpayPaymentResponse> createVnpay(
      @Valid @RequestBody CreateVnpayPaymentRequest request, HttpServletRequest servletRequest) {
    return paymentFacade.createVnpay(request.bookingId(), servletRequest.getRemoteAddr());
  }

  @GetMapping("/vnpay/ipn")
  @Operation(
      summary = "Receive VNPay server notification",
      tags = {"Payment APIs"})
  public VnpayIpnResponse ipn(@RequestParam MultiValueMap<String, String> parameters) {
    Map<String, String> unique = uniqueParameters(parameters);
    if (unique == null) return new VnpayIpnResponse("97", "Duplicate parameters");
    return paymentFacade.processIpn(unique);
  }

  @GetMapping("/vnpay/return")
  @Operation(
      summary = "Read the VNPay browser return result",
      tags = {"Payment APIs"})
  public ResponseEntity<Void> vnpayReturn(
      @RequestParam MultiValueMap<String, String> parameters) {
    Map<String, String> unique = uniqueParameters(parameters);
    if (unique == null) {
      throw new BookingRequestException(
          HttpStatus.BAD_REQUEST,
          "VNPAY_DUPLICATE_PARAMETER",
          "VNPay return has duplicate parameters");
    }
    BaseResponse<VnpayReturnResponse> result = paymentFacade.processReturn(unique);
    String location =
        "http://localhost:5173/payment/result?bookingId=" + result.getData().bookingId();
    return ResponseEntity.status(HttpStatus.FOUND).header(HttpHeaders.LOCATION, location).build();
  }

  @GetMapping("/{id}")
  @Operation(
      summary = "Get the authenticated customer's payment status",
      tags = {"Payment APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasAnyRole('USER', 'SYSTEM_ADMIN')")
  public BaseResponse<PaymentResponse> findPayment(@PathVariable Long id) {
    return paymentFacade.findPayment(id);
  }

  @GetMapping("/result")
  @Operation(
      summary = "Get the authenticated customer's latest payment result for a booking",
      tags = {"Payment APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasAnyRole('USER', 'SYSTEM_ADMIN')")
  public BaseResponse<PaymentResultResponse> findPaymentResult(@RequestParam Long bookingId) {
    return paymentFacade.findPaymentResult(bookingId);
  }

  private static Map<String, String> uniqueParameters(MultiValueMap<String, String> parameters) {
    Map<String, String> unique = new HashMap<>();
    for (Map.Entry<String, List<String>> entry : parameters.entrySet()) {
      if (entry.getValue().size() != 1) return null;
      unique.put(entry.getKey(), entry.getValue().get(0));
    }
    return unique;
  }
}
