package com.james.LMS.menu;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.james.LMS.controller.MenuController;
import com.james.LMS.facade.impl.MenuFacadeImpl;
import com.james.LMS.interceptor.RestHandlerException;
import com.james.LMS.request.MenuSearchRequest;
import com.james.LMS.service.MenuService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class MenuControllerTest {
  @Test
  void returnsDefaultPaginationAndBadRequestForInvalidInput() throws Exception {
    var service = mock(MenuService.class);
    when(service.findMenus(any(MenuSearchRequest.class)))
        .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 12), 0));
    var mvc =
        MockMvcBuilders.standaloneSetup(new MenuController(new MenuFacadeImpl(service)))
            .setControllerAdvice(new RestHandlerException())
            .build();

    mvc.perform(get("/api/v1/menus"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.data").isArray())
        .andExpect(jsonPath("$.data.currentPage").value(1))
        .andExpect(jsonPath("$.data.pageSize").value(12))
        .andExpect(jsonPath("$.data.totalElements").value(0))
        .andExpect(jsonPath("$.data.empty").value(true));
    mvc.perform(get("/api/v1/menus").param("page", "0")).andExpect(status().isBadRequest());
    mvc.perform(get("/api/v1/menus").param("page", "abc")).andExpect(status().isBadRequest());
  }

  @Test
  void bindsSearchFiltersAndSorting() throws Exception {
    var service = mock(MenuService.class);
    when(service.findMenus(any(MenuSearchRequest.class)))
        .thenReturn(new PageImpl<>(List.of(), PageRequest.of(1, 6), 0));
    var mvc =
        MockMvcBuilders.standaloneSetup(new MenuController(new MenuFacadeImpl(service)))
            .setControllerAdvice(new RestHandlerException())
            .build();

    mvc.perform(
            get("/api/v1/menus")
                .param("keyword", "soup")
                .param("categoryId", "3")
                .param("minPrice", "100000")
                .param("maxPrice", "500000")
                .param("diners", "4")
                .param("sort", "PRICE_ASC")
                .param("page", "2")
                .param("size", "6"))
        .andExpect(status().isOk());

    var captor = ArgumentCaptor.forClass(MenuSearchRequest.class);
    verify(service).findMenus(captor.capture());
    assertThat(captor.getValue().getKeyword()).isEqualTo("soup");
    assertThat(captor.getValue().getCategoryId()).isEqualTo(3L);
    assertThat(captor.getValue().getMinPrice()).isEqualByComparingTo("100000");
    assertThat(captor.getValue().getMaxPrice()).isEqualByComparingTo("500000");
    assertThat(captor.getValue().getDiners()).isEqualTo(4);
    assertThat(captor.getValue().getSort().name()).isEqualTo("PRICE_ASC");
    assertThat(captor.getValue().getPage()).isEqualTo(2);
    assertThat(captor.getValue().getSize()).isEqualTo(6);

    mvc.perform(get("/api/v1/menus").param("minPrice", "500000").param("maxPrice", "100000"))
        .andExpect(status().isBadRequest());
    mvc.perform(get("/api/v1/menus").param("sort", "UNKNOWN")).andExpect(status().isBadRequest());
  }
}
