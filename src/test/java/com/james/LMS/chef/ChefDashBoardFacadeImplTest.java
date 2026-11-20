package com.james.LMS.chef;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.entity.Booking;
import com.james.LMS.entity.ChefSchedule;
import com.james.LMS.entity.User;
import com.james.LMS.enums.ChefScheduleStatus;
import com.james.LMS.facade.impl.ChefDashBoardFacadeImpl;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ChefDashboardStatisticsResponse;
import com.james.LMS.response.ChefWeeklyScheduleResponse;
import com.james.LMS.service.BookingService;
import com.james.LMS.service.ChefScheduleService;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
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
  @Mock private ChefScheduleService chefScheduleService;

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

  @Test
  void getWeeklySchedule_returnsSchedulesGroupedByDay() {
    LocalDate sunday = LocalDate.of(2026, 11, 8);
    Instant sundayNoon = sunday.atTime(12, 0).atZone(ZoneId.systemDefault()).toInstant();
    Instant sundayAfternoon = sunday.atTime(15, 0).atZone(ZoneId.systemDefault()).toInstant();

    User customer = User.builder().id(99L).username("CustomerDuy").phone("0987654321").build();
    Booking booking =
        Booking.builder()
            .id(1001L)
            .bookingCode("GC-BK1001")
            .customer(customer)
            .chef(chef)
            .scheduledAt(sundayNoon)
            .serviceAddress("456 Nguyen Hue, Q1")
            .guestCount(6)
            .totalAmount(BigDecimal.valueOf(1200000))
            .build();

    ChefSchedule schedule =
        ChefSchedule.builder()
            .id(501L)
            .chef(chef)
            .booking(booking)
            .startAt(sundayNoon)
            .endAt(sundayAfternoon)
            .status(ChefScheduleStatus.CONFIRMED)
            .build();

    when(chefScheduleService.findWeeklySchedules(eq(50L), any(Instant.class), any(Instant.class)))
        .thenReturn(List.of(schedule));

    BaseResponse<ChefWeeklyScheduleResponse> response =
        chefDashBoardFacade.getWeeklySchedule(sunday);

    assertTrue(response.isSuccess());
    ChefWeeklyScheduleResponse data = response.getData();
    assertNotNull(data);
    assertEquals(LocalDate.of(2026, 11, 8), data.startDate());
    assertEquals(LocalDate.of(2026, 11, 14), data.endDate());
    assertEquals(LocalDate.of(2026, 11, 1), data.prevWeekStartDate());
    assertEquals(LocalDate.of(2026, 11, 15), data.nextWeekStartDate());
    assertEquals(7, data.days().size());
    assertEquals("SUN", data.days().get(0).dayOfWeek());
    assertEquals(1, data.days().get(0).scheduleCount());
    assertEquals(501L, data.days().get(0).items().get(0).id());
    assertEquals("GC-BK1001", data.days().get(0).items().get(0).bookingCode());
    assertEquals("CustomerDuy", data.days().get(0).items().get(0).customerName());
  }

  @Test
  void seedMockSchedules_callsServiceSuccessfully() {
    BaseResponse<String> response = chefDashBoardFacade.seedMockSchedules();

    assertTrue(response.isSuccess());
    assertNotNull(response.getData());
    org.mockito.Mockito.verify(chefScheduleService).seedMockSchedules(50L);
  }
}
