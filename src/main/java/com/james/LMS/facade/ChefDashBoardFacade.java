package com.james.LMS.facade;

import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ChefDashboardStatisticsResponse;

public interface ChefDashBoardFacade {
  BaseResponse<ChefDashboardStatisticsResponse> getDashboardStatistics(Integer month, Integer year);
}
