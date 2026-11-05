package com.james.LMS.repository;

import com.james.LMS.entity.BookingRequest;
import com.james.LMS.enums.BookingRequestStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRequestRepository extends JpaRepository<BookingRequest, Long> {
  Optional<BookingRequest> findFirstByBooking_IdAndIsActiveTrueAndStatusInOrderByIdDesc(
      Long bookingId, List<BookingRequestStatus> statuses);

  @Query("""
      select r.id from BookingRequest r
      where r.isActive = true and r.status in :statuses
        and r.expiresAt is not null and r.expiresAt <= :now
      order by r.expiresAt, r.id
      """)
  List<Long> findDueIds(
      @Param("statuses") List<BookingRequestStatus> statuses,
      @Param("now") Instant now,
      Pageable pageable);

  @Query("select r.booking.id from BookingRequest r where r.id = :id")
  Optional<Long> findBookingIdById(@Param("id") Long id);
}
