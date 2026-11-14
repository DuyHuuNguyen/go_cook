package com.james.LMS.chef;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.james.LMS.dto.DishDTO;
import com.james.LMS.dto.ExploreChefDTO;
import com.james.LMS.exception.EntityNotFoundException;
import com.james.LMS.facade.impl.ExploreChefFacadeImpl;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ExploreChefDetailResponse;
import com.james.LMS.response.ExploreChefResponse;
import com.james.LMS.response.KeySetPaginationResponse;
import com.james.LMS.response.MenuResponse;
import com.james.LMS.service.BookingService;
import com.james.LMS.service.ChefProfileService;
import com.james.LMS.service.DishService;
import com.james.LMS.service.MenuService;
import com.james.LMS.service.UserService;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ExploreChefFacadeImplTest {

  @Mock private UserService userService;
  @Mock private BookingService bookingService;
  @Mock private DishService dishService;
  @Mock private ChefProfileService chefProfileService;
  @Mock private MenuService menuService;

  @InjectMocks private ExploreChefFacadeImpl exploreChefFacade;

  @Test
  void findExploreChefByLastIdReturnsEmptyKeySetWhenNoChefsFound() {
    when(userService.findChefByLastId(0L)).thenReturn(List.of());

    BaseResponse<KeySetPaginationResponse<ExploreChefResponse>> response =
        exploreChefFacade.findExploreChefByLastId(null);

    assertTrue(response.isSuccess());
    assertTrue(response.getData().getData().isEmpty());
    assertEquals(-1L, response.getData().getLastId());
    assertFalse(response.getData().getHasNext());
    verifyNoInteractions(dishService, bookingService);
  }

  @Test
  void findExploreChefByLastIdMapsChefDishesAndBookingStats() {
    long onboardedMillis = 1700000000000L;
    ExploreChefDTO chef1 =
        new ExploreChefDTO(
            10L,
            "chef10",
            "0901234567",
            "chef10@example.com",
            "https://avatar/10.png",
            "Chuyên món Việt",
            5,
            "Approved",
            onboardedMillis);
    ExploreChefDTO chef2 =
        new ExploreChefDTO(
            15L,
            "chef15",
            "0907654321",
            "chef15@example.com",
            null,
            "Đầu bếp món Âu",
            3,
            null,
            null);

    when(userService.findChefByLastId(5L)).thenReturn(List.of(chef1, chef2));
    when(dishService.findDishesByChefIds(List.of(10L, 15L)))
        .thenReturn(Map.of(10L, List.of(DishDTO.builder().id(100L).name("Phở bò").build())));
    when(bookingService.findChefBookingStats(List.of(10L, 15L)))
        .thenReturn(Map.of(10L, new BookingService.ChefBookingStats(12, 9)));

    BaseResponse<KeySetPaginationResponse<ExploreChefResponse>> response =
        exploreChefFacade.findExploreChefByLastId(5L);

    assertTrue(response.isSuccess());
    KeySetPaginationResponse<ExploreChefResponse> page = response.getData();
    assertTrue(page.getHasNext());
    assertEquals(15L, page.getLastId());
    assertEquals(2, page.getData().size());

    ExploreChefResponse first = page.getData().get(0);
    assertEquals(10L, first.getUserId());
    assertEquals("chef10", first.getUsername());
    assertEquals(
        LocalDateTime.ofInstant(Instant.ofEpochMilli(onboardedMillis), ZoneId.systemDefault()),
        first.getOnboardedAt());
    assertEquals(1, first.getDishes().size());
    assertEquals("Phở bò", first.getDishes().get(0).getName());
    assertEquals(12, first.getTotalBookings());
    assertEquals(9, first.getTotalSuccessfullyBookings());

    ExploreChefResponse second = page.getData().get(1);
    assertEquals(15L, second.getUserId());
    assertNull(second.getOnboardedAt());
    assertNotNull(second.getDishes());
    assertTrue(second.getDishes().isEmpty());
    assertEquals(0, second.getTotalBookings());
    assertEquals(0, second.getTotalSuccessfullyBookings());
  }

  @Test
  void findExploreChefDetailByChefIdThrowsWhenChefNotFound() {
    when(userService.findApprovedChefDetailByUserId(999L)).thenReturn(Optional.empty());

    assertThrows(
        EntityNotFoundException.class, () -> exploreChefFacade.findExploreChefDetailByChefId(999L));
  }

  @Test
  void findExploreChefDetailByChefIdReturnsFullProfileSkillsAreasAndMenus() {
    long onboardedMillis = 1700000000000L;
    ExploreChefDTO chef =
        new ExploreChefDTO(
            10L,
            "chef10",
            "0901234567",
            "chef10@example.com",
            "https://avatar/10.png",
            "Chuyên món Việt & tiệc gia đình",
            8,
            "Approved",
            onboardedMillis);
    MenuResponse menu =
        new MenuResponse(
            201L,
            "Mâm cơm gia đình",
            "4 món truyền thống",
            new BigDecimal("650000"),
            4,
            6,
            "ACTIVE",
            1700000000000L,
            new MenuResponse.CategorySummary(1L, "Cơm gia đình"),
            new MenuResponse.SellerSummary(10L, "chef10", "https://avatar/10.png"),
            List.of(new MenuResponse.DishSummary(100L, "Phở bò")),
            List.of("https://img/menu.jpg"));

    when(userService.findApprovedChefDetailByUserId(10L)).thenReturn(Optional.of(chef));
    when(dishService.findDishesByChefIds(List.of(10L)))
        .thenReturn(Map.of(10L, List.of(DishDTO.builder().id(100L).name("Phở bò").build())));
    when(bookingService.findChefBookingStats(List.of(10L)))
        .thenReturn(Map.of(10L, new BookingService.ChefBookingStats(15, 14)));
    when(chefProfileService.findActiveServiceAreasByChefUserId(10L))
        .thenReturn(
            List.of(
                new ChefProfileService.ServiceAreaInfo(
                    "79", "Thành phố Hồ Chí Minh", "26734", "Phường Bến Nghé")));
    when(menuService.findPublicMenusByChefId(10L)).thenReturn(List.of(menu));

    BaseResponse<ExploreChefDetailResponse> result =
        exploreChefFacade.findExploreChefDetailByChefId(10L);

    assertTrue(result.isSuccess());
    ExploreChefDetailResponse detail = result.getData();
    assertEquals(10L, detail.getUserId());
    assertEquals("chef10", detail.getUsername());
    assertEquals(8, detail.getExperienceYears());
    assertEquals(
        LocalDateTime.ofInstant(Instant.ofEpochMilli(onboardedMillis), ZoneId.systemDefault()),
        detail.getOnboardedAt());
    assertEquals(1, detail.getDishes().size());
    assertEquals(1, detail.getServiceAreas().size());
    assertEquals("Thành phố Hồ Chí Minh", detail.getServiceAreas().get(0).getProvinceName());
    assertEquals(1, detail.getMenus().size());
    assertEquals("Mâm cơm gia đình", detail.getMenus().get(0).name());
    assertEquals(1, detail.getTotalMenus());
    assertEquals(15, detail.getTotalBookings());
    assertEquals(14, detail.getTotalSuccessfullyBookings());
  }
}
