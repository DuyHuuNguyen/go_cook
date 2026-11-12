package com.james.LMS.service;

import com.james.LMS.response.CreateVnpayPaymentResponse;
import com.james.LMS.response.PaymentResponse;
import com.james.LMS.response.PaymentResultResponse;
import com.james.LMS.response.VnpayIpnResponse;
import com.james.LMS.response.VnpayReturnResponse;
import java.util.Map;

public interface PaymentService {
  CreateVnpayPaymentResponse createVnpay(Long bookingId, Long customerId, String ipAddress);

  PaymentResponse findOwnedPayment(Long paymentId, Long customerId);

  PaymentResultResponse findOwnedPaymentResult(Long bookingId, Long customerId);

  VnpayIpnResponse processVnpayIpn(Map<String, String> parameters);

  VnpayReturnResponse processVnpayReturn(Map<String, String> parameters);
}
