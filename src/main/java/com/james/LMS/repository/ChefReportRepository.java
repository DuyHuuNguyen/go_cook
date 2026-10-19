package com.james.LMS.repository;

import com.james.LMS.entity.ChefReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChefReportRepository extends JpaRepository<ChefReport,Long> {
}
