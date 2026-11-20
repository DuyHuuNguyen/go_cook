package com.james.LMS.facade.impl;

import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.facade.PaymentFacade;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.CreateVnpayPaymentResponse;
import com.james.LMS.response.PaymentResponse;
import com.james.LMS.response.PaymentResultResponse;
import com.james.LMS.response.VnpayIpnResponse;
import com.james.LMS.response.VnpayReturnResponse;
import com.james.LMS.service.PaymentService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentFacadeImpl implements PaymentFacade {
  private final PaymentService paymentService;

  @Override
  public BaseResponse<CreateVnpayPaymentResponse> createVnpay(Long bookingId, String ipAddress) {
    return BaseResponse.build(
        paymentService.createVnpay(
            bookingId, SecurityUserDetails.getPrincipal().getId(), ipAddress),
        true);
  }

  @Override
  public BaseResponse<PaymentResponse> findPayment(Long paymentId) {
    return BaseResponse.build(
        paymentService.findOwnedPayment(paymentId, SecurityUserDetails.getPrincipal().getId()),
        true);
  }

  @Override
  public BaseResponse<PaymentResultResponse> findPaymentResult(Long bookingId) {
    return BaseResponse.build(
        paymentService.findOwnedPaymentResult(
            bookingId, SecurityUserDetails.getPrincipal().getId()),
        true);
  }

  @Override
  public VnpayIpnResponse processIpn(Map<String, String> parameters) {
    return paymentService.processVnpayIpn(parameters);
  }

  @Override
  public BaseResponse<VnpayReturnResponse> processReturn(Map<String, String> parameters) {
    return BaseResponse.build(paymentService.processVnpayReturn(parameters), true);
  }
}
