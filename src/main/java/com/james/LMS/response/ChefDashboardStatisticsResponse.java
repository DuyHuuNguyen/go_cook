package com.james.LMS.response;

import java.math.BigDecimal;
import lombok.Builder;

@Builder
public record ChefDashboardStatisticsResponse(
    long pendingOrdersCount,
    long servingOrdersCount,
    long awaitingAcceptanceCount,
    BigDecimal monthlyIncome,
    int currentMonth,
    int currentYear) {}

