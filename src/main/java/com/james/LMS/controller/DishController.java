package com.james.LMS.controller;

import com.james.LMS.config.SecurityConfig;
import com.james.LMS.facade.DishFacade;
import com.james.LMS.request.DishSearchRequest;
import com.james.LMS.request.UpsertDishRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.DishResponse;
import com.james.LMS.response.KeySetPaginationResponse;
import com.james.LMS.response.PaginationResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dishes")
@RequiredArgsConstructor
public class DishController {

  private final DishFacade dishFacade;

  @GetMapping("/search")
  @ResponseStatus(HttpStatus.OK)
  @Operation(
      summary = "Search active dishes by a partial name",
      description = "Name matching is case-insensitive. Page is one-based.",
      tags = {"Dish APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  public BaseResponse<PaginationResponse<DishResponse>> searchByName(
      @Valid @ParameterObject DishSearchRequest request) {
    return dishFacade.searchByName(request);
  }

  @GetMapping("/{lastId}")
  @ResponseStatus(HttpStatus.OK)
  @Operation(
      tags = {"Category APIs"},
      summary = "Pagination with id > last id and limit = 20")
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasAuthority('ROLE_CHEF')")
  public BaseResponse<KeySetPaginationResponse<DishResponse>> findByLastId(
      @PathVariable("lastId") Long lastId, @RequestParam(required = false) String name) {
    return this.dishFacade.findByLastId(lastId, name);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.OK)
  @Operation(tags = {"Category APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasAuthority('ROLE_CHEF')")
  BaseResponse<Void> createDish(@Valid @RequestBody UpsertDishRequest request) {
    return this.dishFacade.createDish(request);
  }
}
