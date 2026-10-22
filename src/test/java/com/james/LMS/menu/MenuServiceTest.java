package com.james.LMS.menu;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.james.LMS.entity.*;
import com.james.LMS.repository.*;
import com.james.LMS.response.PaginationResponse;
import com.james.LMS.service.impl.MenuServiceImpl;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.*;

class MenuServiceTest {
  private final MenuRepository menus = mock(MenuRepository.class);
  private final MenuDishRepository dishes = mock(MenuDishRepository.class);
  private final MenuAssetRepository assets = mock(MenuAssetRepository.class);
  private MenuServiceImpl service;

  @BeforeEach
  void setUp() {
    service = new MenuServiceImpl(menus, dishes, assets);
  }

  @Test
  void groupsDishesAndImagesByMenuAndPreservesTotals() {
    var category = Category.builder().id(1L).name("Family").build();
    var seller = User.builder().id(2L).username("Chef").password("private").build();
    var first =
        Menu.builder()
            .id(5L)
            .name("Dinner")
            .category(category)
            .seller(seller)
            .tempPrice(new BigDecimal("239000"))
            .build();
    var second = Menu.builder().id(4L).name("Lunch").category(category).seller(seller).build();
    var pageable = PageRequest.of(0, 2, Sort.by("id").descending());
    when(menus.findListedMenus(pageable))
        .thenReturn(new PageImpl<>(List.of(first, second), pageable, 7));
    when(dishes.findListedDishes(List.of(5L, 4L)))
        .thenReturn(
            List.of(
                MenuDish.builder()
                    .menu(first)
                    .dish(Dish.builder().id(8L).name("Soup").build())
                    .build()));
    when(assets.findByMenuIdInAndIsActiveTrueOrderByIdAsc(List.of(5L, 4L)))
        .thenReturn(List.of(MenuAsset.builder().menu(second).url("/lunch.png").build()));

    var response = PaginationResponse.from(service.findMenus(0, 2));

    assertThat(response.getTotalElements()).isEqualTo(7);
    assertThat(response.getTotalPages()).isEqualTo(4);
    assertThat(response.isHasNext()).isTrue();
    assertThat(response.getData().getFirst().dishes()).extracting("name").containsExactly("Soup");
    assertThat(response.getData().getFirst().imageUrls()).isEmpty();
    assertThat(response.getData().get(1).dishes()).isEmpty();
    assertThat(response.getData().get(1).imageUrls()).containsExactly("/lunch.png");
    verify(menus).findListedMenus(pageable);
  }

  @Test
  void outOfRangePageRetainsTotalWithoutFetchingChildren() {
    var pageable = PageRequest.of(5, 12, Sort.by("id").descending());
    when(menus.findListedMenus(any())).thenReturn(new PageImpl<>(List.of(), pageable, 20));
    var response = PaginationResponse.from(service.findMenus(5, 12));
    assertThat(response.getData()).isEmpty();
    assertThat(response.getTotalElements()).isEqualTo(20);
    assertThat(response.getCurrentPage()).isEqualTo(5);
    verifyNoInteractions(dishes, assets);
  }

  @Test
  void rejectsInvalidPaginationBeforeQuerying() {
    assertThatIllegalArgumentException().isThrownBy(() -> service.findMenus(-1, 12));
    assertThatIllegalArgumentException().isThrownBy(() -> service.findMenus(0, 0));
    assertThatIllegalArgumentException().isThrownBy(() -> service.findMenus(0, 101));
    verifyNoInteractions(menus, dishes, assets);
  }

  @Test
  void paginationSupportsLongTotals() {
    var page = new PageImpl<>(List.of("menu"), PageRequest.of(0, 1), 3_000_000_000L);
    assertThat(PaginationResponse.from(page).getTotalElements()).isEqualTo(3_000_000_000L);
  }
}
