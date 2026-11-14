package com.james.LMS.service;

import com.james.LMS.entity.ChefSchedule;
import java.time.Instant;
import java.util.List;

public interface ChefScheduleService {
  List<ChefSchedule> findWeeklySchedules(Long chefId, Instant startOfWeek, Instant endOfWeek);

  void seedMockSchedules(Long chefId);
}
