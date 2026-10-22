package com.james.LMS.menu;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.james.LMS.entity.*;
import com.james.LMS.enums.MenuSort;
import com.james.LMS.repository.*;
import com.james.LMS.request.MenuSearchRequest;
import com.james.LMS.response.PaginationResponse;
import com.james.LMS.service.impl.MenuServiceImpl;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

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
    var pageable =
        PageRequest.of(
            0,
            2,
            Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));
    when(menus.findAll(any(Specification.class), eq(pageable)))
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

    var response = PaginationResponse.from(service.findMenus(request(1, 2, MenuSort.LATEST)));

    assertThat(response.getTotalElements()).isEqualTo(7);
    assertThat(response.getTotalPages()).isEqualTo(4);
    assertThat(response.isHasNext()).isTrue();
    assertThat(response.getData().getFirst().dishes()).extracting("name").containsExactly("Soup");
    assertThat(response.getData().getFirst().imageUrls()).isEmpty();
    assertThat(response.getData().get(1).dishes()).isEmpty();
    assertThat(response.getData().get(1).imageUrls()).containsExactly("/lunch.png");
    verify(menus).findAll(any(Specification.class), eq(pageable));
  }

  @Test
  void outOfRangePageRetainsTotalWithoutFetchingChildren() {
    var pageable =
        PageRequest.of(
            5,
            12,
            Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));
    when(menus.findAll(any(Specification.class), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(), pageable, 20));
    var response = PaginationResponse.from(service.findMenus(request(6, 12, MenuSort.LATEST)));
    assertThat(response.getData()).isEmpty();
    assertThat(response.getTotalElements()).isEqualTo(20);
    assertThat(response.getCurrentPage()).isEqualTo(6);
    verifyNoInteractions(dishes, assets);
  }

  @Test
  void rejectsInvalidPaginationBeforeQuerying() {
    assertThatIllegalArgumentException()
        .isThrownBy(() -> service.findMenus(request(0, 12, MenuSort.LATEST)));
    assertThatIllegalArgumentException()
        .isThrownBy(() -> service.findMenus(request(1, 0, MenuSort.LATEST)));
    assertThatIllegalArgumentException()
        .isThrownBy(() -> service.findMenus(request(1, 101, MenuSort.LATEST)));
    verifyNoInteractions(menus, dishes, assets);
  }

  @Test
  void createsTheRequestedDatabaseSortWithStableIdTieBreaker() {
    when(menus.findAll(any(Specification.class), any(Pageable.class)))
        .thenAnswer(
            invocation -> {
              Pageable pageable = invocation.getArgument(1);
              return new PageImpl<Menu>(List.of(), pageable, 0);
            });

    service.findMenus(request(1, 12, MenuSort.PRICE_ASC));
    service.findMenus(request(1, 12, MenuSort.NAME_DESC));
    service.findMenus(request(1, 12, MenuSort.LATEST));

    var pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
    verify(menus, times(3)).findAll(any(Specification.class), pageableCaptor.capture());
    assertThat(pageableCaptor.getAllValues().get(0).getSort().toString())
        .isEqualTo("tempPrice: ASC,id: DESC");
    assertThat(pageableCaptor.getAllValues().get(1).getSort().toString())
        .isEqualTo("name: DESC, ignoring case,id: DESC");
    assertThat(pageableCaptor.getAllValues().get(2).getSort().toString())
        .isEqualTo("createdAt: DESC,id: DESC");
  }

  @Test
  void paginationSupportsLongTotals() {
    var page = new PageImpl<>(List.of("menu"), PageRequest.of(0, 1), 3_000_000_000L);
    assertThat(PaginationResponse.from(page).getTotalElements()).isEqualTo(3_000_000_000L);
  }

  private MenuSearchRequest request(int page, int size, MenuSort sort) {
    var request = new MenuSearchRequest();
    request.setPage(page);
    request.setSize(size);
    request.setSort(sort);
    return request;
  }
}
