package com.james.LMS.service;

import com.james.LMS.entity.Booking;
import com.james.LMS.request.CreateBookingRequest;
import java.util.Optional;
import com.james.LMS.response.MatchingChefResponse;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookingService {
  Booking createBooking(CreateBookingRequest request, Long customerId);

  Page<Booking> findCustomerBookings(Long customerId, Pageable pageable);

  List<MatchingChefResponse> findMatchingChefs(Long bookingId, Long customerId);

  Optional<Booking> findById(Long id);
}
