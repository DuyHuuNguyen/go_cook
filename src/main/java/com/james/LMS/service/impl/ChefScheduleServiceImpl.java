package com.james.LMS.service.impl;

import com.james.LMS.repository.ChefScheduleRepository;
import com.james.LMS.service.ChefScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChefScheduleServiceImpl implements ChefScheduleService {
  private final ChefScheduleRepository scheduleRepository;
}
