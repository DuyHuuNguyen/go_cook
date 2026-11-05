package com.james.LMS.service;

import com.james.LMS.response.BookingChefRequestResponse;

public interface BookingRequestService {
  BookingChefRequestResponse create(Long bookingId, Long chefId, Long customerId);

  void expireDueRequest(Long requestId);
}
