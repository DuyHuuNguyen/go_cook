package com.james.LMS.response;

import com.james.LMS.enums.PaymentStatus;

public record VnpayReturnResponse(
    Long paymentId, Long bookingId, PaymentStatus status, String vnpResponseCode, boolean verified) {}
