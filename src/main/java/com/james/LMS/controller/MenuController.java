package com.james.LMS.controller;

import com.james.LMS.facade.MenuFacade;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.MenuResponse;
import com.james.LMS.response.PaginationResponse;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/menus")
@RequiredArgsConstructor
public class MenuController {
  private final MenuFacade menuFacade;

  @GetMapping
  @Operation(
      summary = "List visible menus with their dishes and images",
      description = "One-based page; size 1-100 (default 12). Ordered by menu ID descending.",
      tags = {"Menu APIs"})
  public BaseResponse<PaginationResponse<MenuResponse>> findMenus(
      @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "12") int size) {
    return menuFacade.findMenus(page -1, size);
  }
}
