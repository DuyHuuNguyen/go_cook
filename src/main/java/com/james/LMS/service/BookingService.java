package com.james.LMS.service;

import com.james.LMS.entity.Booking;
import com.james.LMS.request.CreateBookingRequest;
import com.james.LMS.response.BookingDetailResponse;
import com.james.LMS.response.MatchingChefResponse;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookingService {
  Booking createBooking(CreateBookingRequest request, Long customerId);

  Page<Booking> findCustomerBookings(Long customerId, Pageable pageable);

  BookingDetailResponse findBookingDetails(Long bookingId, Long customerId);

  List<MatchingChefResponse> findMatchingChefs(Long bookingId, Long customerId);
}
