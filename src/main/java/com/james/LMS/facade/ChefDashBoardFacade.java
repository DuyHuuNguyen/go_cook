package com.james.LMS.facade;

import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ChefDashboardStatisticsResponse;
import com.james.LMS.response.ChefWeeklyScheduleResponse;
import java.time.LocalDate;

public interface ChefDashBoardFacade {
  BaseResponse<ChefDashboardStatisticsResponse> getDashboardStatistics(Integer month, Integer year);

  BaseResponse<ChefWeeklyScheduleResponse> getWeeklySchedule(LocalDate startDate);
}
