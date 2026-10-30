package com.james.LMS.service;

import com.james.LMS.entity.Booking;
import com.james.LMS.request.CreateBookingRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookingService {
  Booking createBooking(CreateBookingRequest request, Long customerId);

  Page<Booking> findCustomerBookings(Long customerId, Pageable pageable);
}
