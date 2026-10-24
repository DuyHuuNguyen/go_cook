package com.james.LMS.controller;

import com.james.LMS.facade.AdminUserFacade;
import com.james.LMS.request.AdminUserStatusRequest;
import com.james.LMS.response.AdminUserResponse;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasAuthority('ROLE_SYSTEM_ADMIN')")
public class AdminUserController {
  private final AdminUserFacade facade;

  @GetMapping
  public BaseResponse<PaginationResponse<AdminUserResponse>> list(
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "20") int size) {
    return facade.list(keyword, status, page, size);
  }

  @GetMapping("/{id}")
  public BaseResponse<AdminUserResponse> detail(@PathVariable Long id) {
    return facade.detail(id);
  }

  @PatchMapping("/{id}/status")
  public BaseResponse<AdminUserResponse> updateStatus(
      @PathVariable Long id, @Valid @RequestBody AdminUserStatusRequest request) {
    return facade.updateStatus(id, request);
  }
}
