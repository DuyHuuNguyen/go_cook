package com.james.LMS.repository;

import com.james.LMS.entity.ChefSchedule;
import com.james.LMS.enums.ChefScheduleStatus;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChefScheduleRepository extends JpaRepository<ChefSchedule, Long> {
  @Query("""
      select distinct s.chef.id from ChefSchedule s
      where s.chef.id in :chefIds and s.isActive = true
        and s.startAt < :newEndAt and s.endAt > :newStartAt
        and (s.status = :confirmed or
             (s.status = :held and (s.holdExpiresAt is null or s.holdExpiresAt > :now)))
      """)
  List<Long> findBusyChefIdsDuring(
      @Param("chefIds") List<Long> chefIds,
      @Param("newStartAt") Instant newStartAt,
      @Param("newEndAt") Instant newEndAt,
      @Param("now") Instant now,
      @Param("confirmed") ChefScheduleStatus confirmed,
      @Param("held") ChefScheduleStatus held);

  @Query("""
      select count(s.id) from ChefSchedule s
      where s.chef.id = :chefId and s.isActive = true
        and s.startAt < :newEndAt and s.endAt > :newStartAt
        and (s.status = :confirmed or
          (s.status = :held and (s.holdExpiresAt is null or s.holdExpiresAt > :now)))
      """)
  long countBlockingOverlaps(
      @Param("chefId") Long chefId,
      @Param("newStartAt") Instant newStartAt,
      @Param("newEndAt") Instant newEndAt,
      @Param("now") Instant now,
      @Param("confirmed") ChefScheduleStatus confirmed,
      @Param("held") ChefScheduleStatus held);

  List<ChefSchedule> findByBooking_IdAndChef_IdAndStatus(
      Long bookingId, Long chefId, ChefScheduleStatus status);
}
