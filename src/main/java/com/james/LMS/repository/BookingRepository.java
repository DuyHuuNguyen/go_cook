package com.james.LMS.repository;

import com.james.LMS.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
  Page<Booking> findByCustomer_IdAndIsActiveTrue(Long customerId, Pageable pageable);
}
