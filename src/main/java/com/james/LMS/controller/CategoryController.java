package com.james.LMS.controller;

import com.james.LMS.config.SecurityConfig;
import com.james.LMS.facade.CategoryFacade;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.CategoryResponse;
import com.james.LMS.response.KeySetPaginationResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

  private final CategoryFacade categoryFacade;

  @GetMapping("/{lastId}")
  @ResponseStatus(HttpStatus.OK)
  @Operation(
      tags = {"Category APIs"},
      summary = "Pagination with id > last id and limit = 20")
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("isAuthenticated()")
  public BaseResponse<KeySetPaginationResponse<CategoryResponse>> findByLastId(
      @PathVariable("lastId") Long lastId) {
    return this.categoryFacade.findByLastId(lastId);
  }
}
