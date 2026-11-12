package com.james.LMS.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.when;

import com.james.LMS.controller.PaymentController;
import com.james.LMS.facade.PaymentFacade;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.VnpayReturnResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {
  @Mock private PaymentFacade paymentFacade;
  @InjectMocks private PaymentController paymentController;

  @Test
  void vnpayReturnRedirectsToFrontendPaymentResult() {
    MultiValueMap<String, String> parameters = new LinkedMultiValueMap<>();
    parameters.add("vnp_TxnRef", "ref123");
    when(paymentFacade.processReturn(anyMap()))
        .thenReturn(
            BaseResponse.build(
                new VnpayReturnResponse(2L, 42L, null, "00", true), true));

    var response = paymentController.vnpayReturn(parameters);

    assertEquals(HttpStatus.FOUND, response.getStatusCode());
    assertEquals(
        "http://localhost:5173/payment/result?bookingId=42",
        response.getHeaders().getFirst(HttpHeaders.LOCATION));
  }
}
