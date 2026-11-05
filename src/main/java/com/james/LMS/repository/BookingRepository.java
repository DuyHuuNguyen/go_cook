package com.james.LMS.repository;

import com.james.LMS.entity.Booking;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
  Page<Booking> findByCustomer_IdAndIsActiveTrue(Long customerId, Pageable pageable);

  @EntityGraph(attributePaths = {"dishes", "dishes.dish"})
  Optional<Booking> findByIdAndCustomer_IdAndIsActiveTrue(Long id, Long customerId);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select b from Booking b where b.id = :id and b.customer.id = :customerId and b.isActive = true")
  Optional<Booking> lockOwnedBooking(@Param("id") Long id, @Param("customerId") Long customerId);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select b from Booking b where b.id = :id")
  Optional<Booking> lockById(@Param("id") Long id);
}
