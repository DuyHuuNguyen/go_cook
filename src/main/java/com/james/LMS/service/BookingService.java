package com.james.LMS.service;

import com.james.LMS.entity.Booking;
import com.james.LMS.request.CreateBookingRequest;
import com.james.LMS.response.MatchingChefResponse;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookingService {
  record ChefBookingStats(int totalBookings, int totalSuccessfullyBookings) {}

  Booking createBooking(CreateBookingRequest request, Long customerId);

  Page<Booking> findCustomerBookings(Long customerId, Pageable pageable);

  List<MatchingChefResponse> findMatchingChefs(Long bookingId, Long customerId);

  Optional<Booking> findById(Long id);

  List<Booking> findByLastIdAndChefIdOrderByIdDesc(Long lastId, Long chefId);

  Optional<Booking> findBookingByIdAndChefIdAndIsActiveTrue(Long id, Long chefId);

  void save(Booking booking);

  Map<Long, ChefBookingStats> findChefBookingStats(List<Long> chefIds);
}
