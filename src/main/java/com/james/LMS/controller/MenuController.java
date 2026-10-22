package com.james.LMS.controller;

import com.james.LMS.facade.MenuFacade;
import com.james.LMS.request.MenuSearchRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.MenuResponse;
import com.james.LMS.response.PaginationResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/menus")
@RequiredArgsConstructor
public class MenuController {
  private final MenuFacade menuFacade;

  @GetMapping
  @Operation(
      summary = "List visible menus with their dishes and images",
      description =
          "Search by menu or dish, filter by category, price and diners, then sort by latest, price or name. Page is one-based.",
      tags = {"Menu APIs"})
  public BaseResponse<PaginationResponse<MenuResponse>> findMenus(
      @Valid @ParameterObject MenuSearchRequest request) {
    return menuFacade.findMenus(request);
  }
}
