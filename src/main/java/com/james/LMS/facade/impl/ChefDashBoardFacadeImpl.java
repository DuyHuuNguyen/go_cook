package com.james.LMS.facade.impl;

import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.facade.ChefDashBoardFacade;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ChefDashboardStatisticsResponse;
import com.james.LMS.service.BookingService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChefDashBoardFacadeImpl implements ChefDashBoardFacade {

  private final BookingService bookingService;

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
}
