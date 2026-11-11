package com.james.LMS.repository;

import com.james.LMS.entity.Booking;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
  Page<Booking> findByCustomer_IdAndIsActiveTrue(Long customerId, Pageable pageable);

  @EntityGraph(attributePaths = {"dishes", "dishes.dish"})
  Optional<Booking> findByIdAndCustomer_IdAndIsActiveTrue(Long id, Long customerId);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query(
      "select b from Booking b where b.id = :id and b.customer.id = :customerId and b.isActive = true")
  Optional<Booking> lockOwnedBooking(@Param("id") Long id, @Param("customerId") Long customerId);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select b from Booking b where b.id = :id")
  Optional<Booking> lockById(@Param("id") Long id);

  @EntityGraph(attributePaths = {"dishes", "dishes.dish"})
  List<Booking> findByChef_IdAndIsActiveTrueOrderByIdDesc(Long chefId, Limit limit);

  @EntityGraph(attributePaths = {"dishes", "dishes.dish"})
  List<Booking> findByIdGreaterThanAndChef_IdAndIsActiveTrueOrderByIdDesc(
      @Param("id") Long id, @Param("chefId") Long chefId, Limit limit);

  Optional<Booking> findBookingByIdAndChef_IdAndIsActiveTrue(
      @Param("id") Long id, @Param("chefId") Long chefId);

  @Query("""
      select b.chef.id,
             count(b.id),
             sum(case when b.bookingStatus in :successStatuses then 1 else 0 end)
      from Booking b
      where b.chef.id in :chefIds and b.isActive = true
      group by b.chef.id
      """)
  List<Object[]> countChefBookingStats(
      @Param("chefIds") List<Long> chefIds, @Param("successStatuses") List<String> successStatuses);
}
