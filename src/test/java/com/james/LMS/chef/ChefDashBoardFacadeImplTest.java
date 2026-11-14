package com.james.LMS.chef;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.entity.User;
import com.james.LMS.facade.impl.ChefDashBoardFacadeImpl;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ChefDashboardStatisticsResponse;
import com.james.LMS.service.BookingService;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class ChefDashBoardFacadeImplTest {

  @Mock private BookingService bookingService;

  @InjectMocks private ChefDashBoardFacadeImpl chefDashBoardFacade;

  private User chef;

  @BeforeEach
  void setUp() {
    chef = User.builder().id(50L).username("ChefMinh").email("chef@test.com").build();
    SecurityUserDetails principal = SecurityUserDetails.build(chef, List.of());
    SecurityContextHolder.getContext()
        .setAuthentication(new UsernamePasswordAuthenticationToken(principal, null, List.of()));
  }

  @AfterEach
  void tearDown() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void getDashboardStatistics_calculatesMetricsCorrectly() {
    Map<String, Long> statusCounts =
        Map.of(
            "PENDING", 1L,
            "PENDING_CHEF_ACCEPTANCE", 1L,
            "CONFIRMED", 1L,
            "PREPARING", 1L,
            "AWAITING_ACCEPTANCE", 1L,
            "COMPLETED", 3L);

    when(bookingService.countChefBookingsByStatus(50L)).thenReturn(statusCounts);
    when(bookingService.sumCompletedBookingAmountInPeriod(
            eq(50L), any(Instant.class), any(Instant.class)))
        .thenReturn(BigDecimal.valueOf(1000000));

    BaseResponse<ChefDashboardStatisticsResponse> response =
        chefDashBoardFacade.getDashboardStatistics(10, 2026);

    assertTrue(response.isSuccess());
    ChefDashboardStatisticsResponse data = response.getData();
    assertNotNull(data);
    assertEquals(2, data.pendingOrdersCount());
    assertEquals(2, data.servingOrdersCount());
    assertEquals(1, data.awaitingAcceptanceCount());
    assertEquals(new BigDecimal("850000.00"), data.monthlyIncome());
    assertEquals(10, data.currentMonth());
    assertEquals(2026, data.currentYear());
  }

  @Test
  void getDashboardStatistics_whenNoBookings_returnsZeros() {
    when(bookingService.countChefBookingsByStatus(50L)).thenReturn(Map.of());
    when(bookingService.sumCompletedBookingAmountInPeriod(
            eq(50L), any(Instant.class), any(Instant.class)))
        .thenReturn(BigDecimal.ZERO);

    BaseResponse<ChefDashboardStatisticsResponse> response =
        chefDashBoardFacade.getDashboardStatistics(null, null);

    assertTrue(response.isSuccess());
    ChefDashboardStatisticsResponse data = response.getData();
    assertNotNull(data);
    assertEquals(0, data.pendingOrdersCount());
    assertEquals(0, data.servingOrdersCount());
    assertEquals(0, data.awaitingAcceptanceCount());
    assertEquals(new BigDecimal("0.00"), data.monthlyIncome());
  }
}
