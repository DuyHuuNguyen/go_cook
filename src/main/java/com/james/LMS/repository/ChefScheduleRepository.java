package com.james.LMS.repository;

import com.james.LMS.entity.ChefSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ChefScheduleRepository extends JpaRepository<ChefSchedule,Long> {
}
