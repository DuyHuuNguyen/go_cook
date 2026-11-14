package com.james.LMS.controller;

import com.james.LMS.config.SecurityConfig;
import com.james.LMS.facade.ChefDashBoardFacade;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ChefDashboardStatisticsResponse;
import com.james.LMS.response.ChefWeeklyScheduleResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/v1/chef/dashboards")
@RestController
@RequiredArgsConstructor
public class ChefDashBoardController {
  private final ChefDashBoardFacade chefDashBoardFacade;

  @GetMapping({"", "/statistics"})
  @Operation(
      summary = "Get chef dashboard metrics and statistics",
      tags = {"Chef Dashboard APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasAuthority('ROLE_CHEF') or hasRole('CHEF')")
  public BaseResponse<ChefDashboardStatisticsResponse> getDashboardStatistics(
      @RequestParam(required = false) Integer month, @RequestParam(required = false) Integer year) {
    return chefDashBoardFacade.getDashboardStatistics(month, year);
  }

  @GetMapping("/schedules/weekly")
  @Operation(
      summary = "Get chef weekly schedule with week pagination",
      tags = {"Chef Dashboard APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasAuthority('ROLE_CHEF') or hasRole('CHEF')")
  public BaseResponse<ChefWeeklyScheduleResponse> getWeeklySchedule(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate startDate) {
    return chefDashBoardFacade.getWeeklySchedule(startDate);
  }

  @PostMapping("/schedules/mock-data")
  @Operation(
      summary = "Seed meaningful mock bookings and schedules for the current chef",
      tags = {"Chef Dashboard APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasAuthority('ROLE_CHEF') or hasRole('CHEF')")
  public BaseResponse<String> seedMockSchedules() {
    return chefDashBoardFacade.seedMockSchedules();
  }
}
