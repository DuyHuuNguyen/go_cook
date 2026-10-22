package com.james.LMS.menu;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.james.LMS.controller.MenuController;
import com.james.LMS.facade.impl.MenuFacadeImpl;
import com.james.LMS.interceptor.RestHandlerException;
import com.james.LMS.service.MenuService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class MenuControllerTest {
  @Test
  void returnsDefaultPaginationAndBadRequestForInvalidInput() throws Exception {
    var service = mock(MenuService.class);
    when(service.findMenus(0, 12)).thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 12), 0));
    when(service.findMenus(-1, 12)).thenThrow(new IllegalArgumentException("Invalid page"));
    var mvc =
        MockMvcBuilders.standaloneSetup(new MenuController(new MenuFacadeImpl(service)))
            .setControllerAdvice(new RestHandlerException())
            .build();

    mvc.perform(get("/api/v1/menus"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.data").isArray())
        .andExpect(jsonPath("$.data.currentPage").value(0))
        .andExpect(jsonPath("$.data.pageSize").value(12))
        .andExpect(jsonPath("$.data.totalElements").value(0))
        .andExpect(jsonPath("$.data.empty").value(true));
    mvc.perform(get("/api/v1/menus").param("page", "-1")).andExpect(status().isBadRequest());
    mvc.perform(get("/api/v1/menus").param("page", "abc")).andExpect(status().isBadRequest());
  }
}
