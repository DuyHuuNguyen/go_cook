package com.james.LMS.repository;

import com.james.LMS.entity.Payment;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
  Optional<Payment> findFirstByBooking_IdAndIsActiveTrueOrderByIdDesc(Long bookingId);

  Optional<Payment> findFirstByBooking_IdAndBooking_Customer_IdAndIsActiveTrueOrderByIdDesc(
      Long bookingId, Long customerId);

  List<Payment> findByBooking_IdAndIsActiveTrueOrderByIdDesc(Long bookingId);

  Optional<Payment> findByIdAndBooking_Customer_IdAndIsActiveTrue(Long id, Long customerId);

  Optional<Payment> findByTransactionRefAndIsActiveTrue(String transactionRef);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select p from Payment p where p.transactionRef = :transactionRef and p.isActive = true")
  Optional<Payment> lockByTransactionRef(@Param("transactionRef") String transactionRef);
}
