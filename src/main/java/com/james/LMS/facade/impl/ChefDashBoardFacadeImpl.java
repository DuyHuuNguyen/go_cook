package com.james.LMS.facade.impl;

import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.entity.ChefSchedule;
import com.james.LMS.facade.ChefDashBoardFacade;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ChefDashboardStatisticsResponse;
import com.james.LMS.response.ChefWeeklyScheduleResponse;
import com.james.LMS.service.BookingService;
import com.james.LMS.service.ChefScheduleService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChefDashBoardFacadeImpl implements ChefDashBoardFacade {

  private final BookingService bookingService;
  private final ChefScheduleService chefScheduleService;

  private static final BigDecimal CHEF_REVENUE_SHARE = BigDecimal.valueOf(0.85);

  @Override
  @Transactional(readOnly = true)
  public BaseResponse<ChefDashboardStatisticsResponse> getDashboardStatistics(
      Integer month, Integer year) {
    SecurityUserDetails principal = SecurityUserDetails.getPrincipal();
    Long chefId = principal.getId();

    LocalDate now = LocalDate.now();
    int targetMonth = (month != null && month >= 1 && month <= 12) ? month : now.getMonthValue();
    int targetYear = (year != null && year >= 2000 && year <= 2100) ? year : now.getYear();

    YearMonth yearMonth = YearMonth.of(targetYear, targetMonth);
    Instant startOfMonth = yearMonth.atDay(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
    Instant endOfMonth =
        yearMonth.plusMonths(1).atDay(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

    Map<String, Long> countByStatus = bookingService.countChefBookingsByStatus(chefId);

    long pendingCount =
        countByStatus.getOrDefault("PENDING", 0L)
            + countByStatus.getOrDefault("PENDING_CHEF_ACCEPTANCE", 0L);

    long servingCount =
        countByStatus.getOrDefault("CHEF_ACCEPT", 0L)
            + countByStatus.getOrDefault("CONFIRMED", 0L)
            + countByStatus.getOrDefault("PREPARING", 0L)
            + countByStatus.getOrDefault("COOKING", 0L);

    long awaitingAcceptanceCount = countByStatus.getOrDefault("AWAITING_ACCEPTANCE", 0L);

    BigDecimal totalCompleted =
        bookingService.sumCompletedBookingAmountInPeriod(chefId, startOfMonth, endOfMonth);

    BigDecimal monthlyIncome =
        totalCompleted != null && totalCompleted.compareTo(BigDecimal.ZERO) > 0
            ? totalCompleted.multiply(CHEF_REVENUE_SHARE).setScale(2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

    ChefDashboardStatisticsResponse response =
        ChefDashboardStatisticsResponse.builder()
            .pendingOrdersCount(pendingCount)
            .servingOrdersCount(servingCount)
            .awaitingAcceptanceCount(awaitingAcceptanceCount)
            .monthlyIncome(monthlyIncome)
            .currentMonth(targetMonth)
            .currentYear(targetYear)
            .build();

    return BaseResponse.build(response, true);
  }

  @Override
  @Transactional(readOnly = true)
  public BaseResponse<ChefWeeklyScheduleResponse> getWeeklySchedule(LocalDate startDate) {
    SecurityUserDetails principal = SecurityUserDetails.getPrincipal();
    Long chefId = principal.getId();

    LocalDate baseDate = startDate != null ? startDate : LocalDate.now();
    LocalDate start = baseDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
    LocalDate end = start.plusDays(6);
    LocalDate prevWeek = start.minusWeeks(1);
    LocalDate nextWeek = start.plusWeeks(1);

    Instant startInstant = start.atStartOfDay(ZoneId.systemDefault()).toInstant();
    Instant endInstant = end.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

    List<ChefSchedule> schedules =
        chefScheduleService.findWeeklySchedules(chefId, startInstant, endInstant);

    List<ChefWeeklyScheduleResponse.ChefScheduleItemResponse> allItems =
        schedules.stream().map(ChefWeeklyScheduleResponse.ChefScheduleItemResponse::from).toList();

    List<ChefWeeklyScheduleResponse.ChefScheduleDayResponse> days = new ArrayList<>(7);
    for (int i = 0; i < 7; i++) {
      LocalDate currentDay = start.plusDays(i);
      Instant dayStart = currentDay.atStartOfDay(ZoneId.systemDefault()).toInstant();
      Instant dayEnd = currentDay.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

      List<ChefWeeklyScheduleResponse.ChefScheduleItemResponse> dayItems =
          allItems.stream()
              .filter(item -> item.startAt().isBefore(dayEnd) && item.endAt().isAfter(dayStart))
              .toList();

      String dayOfWeek = currentDay.getDayOfWeek().name().substring(0, 3);
      String displayDate =
          String.format("%02d/%02d", currentDay.getDayOfMonth(), currentDay.getMonthValue());
      boolean isToday = currentDay.equals(LocalDate.now());

      days.add(
          ChefWeeklyScheduleResponse.ChefScheduleDayResponse.builder()
              .date(currentDay)
              .dayOfWeek(dayOfWeek)
              .displayDate(displayDate)
              .isToday(isToday)
              .scheduleCount(dayItems.size())
              .items(dayItems)
              .build());
    }

    int weekOfYear = start.get(WeekFields.of(Locale.getDefault()).weekOfYear());
    String displayRange =
        String.format(
            "%02d/%02d/%04d — %02d/%02d/%04d",
            start.getDayOfMonth(),
            start.getMonthValue(),
            start.getYear(),
            end.getDayOfMonth(),
            end.getMonthValue(),
            end.getYear());

    ChefWeeklyScheduleResponse response =
        ChefWeeklyScheduleResponse.builder()
            .startDate(start)
            .endDate(end)
            .prevWeekStartDate(prevWeek)
            .nextWeekStartDate(nextWeek)
            .weekOfYear(weekOfYear)
            .year(start.getYear())
            .displayRange(displayRange)
            .days(days)
            .allSchedules(allItems)
            .build();

    return BaseResponse.build(response, true);
  }
}
