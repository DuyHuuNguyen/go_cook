package com.james.LMS.service.impl;

import com.james.LMS.entity.ChefSchedule;
import com.james.LMS.repository.ChefScheduleRepository;
import com.james.LMS.service.ChefScheduleService;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChefScheduleServiceImpl implements ChefScheduleService {
  private final ChefScheduleRepository scheduleRepository;

  @Override
  @Transactional(readOnly = true)
  public List<ChefSchedule> findWeeklySchedules(
      Long chefId, Instant startOfWeek, Instant endOfWeek) {
    if (chefId == null || startOfWeek == null || endOfWeek == null) {
      return List.of();
    }
    return scheduleRepository.findWeeklySchedules(chefId, startOfWeek, endOfWeek);
  }
}
