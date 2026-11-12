package com.james.LMS.facade;

import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.CreateVnpayPaymentResponse;
import com.james.LMS.response.PaymentResponse;
import com.james.LMS.response.PaymentResultResponse;
import com.james.LMS.response.VnpayIpnResponse;
import com.james.LMS.response.VnpayReturnResponse;
import java.util.Map;

public interface PaymentFacade {
  BaseResponse<CreateVnpayPaymentResponse> createVnpay(Long bookingId, String ipAddress);

  BaseResponse<PaymentResponse> findPayment(Long paymentId);

  BaseResponse<PaymentResultResponse> findPaymentResult(Long bookingId);

  VnpayIpnResponse processIpn(Map<String, String> parameters);

  BaseResponse<VnpayReturnResponse> processReturn(Map<String, String> parameters);
}
