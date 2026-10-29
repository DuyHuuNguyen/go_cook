package com.james.LMS.controller;

import com.james.LMS.facade.AdminDishFacade;
import com.james.LMS.request.AdminDishStatusRequest;
import com.james.LMS.request.AdminDishUpdateRequest;
import com.james.LMS.response.AdminDishResponse;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/dishes")
@PreAuthorize("hasAuthority('ROLE_SYSTEM_ADMIN')")
public class AdminDishController {
  private final AdminDishFacade facade;

  @GetMapping
  public BaseResponse<PaginationResponse<AdminDishResponse>> list(
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) Boolean isActive,
      @RequestParam(required = false) String ownership,
      @RequestParam(required = false) Long chefId,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "id") String sortBy,
      @RequestParam(defaultValue = "asc") String sortDirection) {
    return facade.list(keyword, isActive, ownership, chefId, page, size, sortBy, sortDirection);
  }

  @GetMapping("/{id}")
  public BaseResponse<AdminDishResponse> detail(@PathVariable Long id) {
    return facade.detail(id);
  }

  @PutMapping("/{id}")
  public BaseResponse<AdminDishResponse> update(
      @PathVariable Long id, @Valid @RequestBody AdminDishUpdateRequest request) {
    return facade.update(id, request);
  }

  @PatchMapping("/{id}/status")
  public BaseResponse<AdminDishResponse> updateStatus(
      @PathVariable Long id, @Valid @RequestBody AdminDishStatusRequest request) {
    return facade.updateStatus(id, request);
  }
}
