package com.james.LMS.controller;

import com.james.LMS.enums.ChefApplicationStatus;
import com.james.LMS.facade.ChefApplicationFacade;
import com.james.LMS.request.ChefReviewRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ChefApplicationResponse;
import com.james.LMS.response.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ChefApplicationController {
  private final ChefApplicationFacade facade;

  @GetMapping("/api/v2/users/chef-application")
  @PreAuthorize("isAuthenticated()")
  public BaseResponse<ChefApplicationResponse> ownApplication() {
    return facade.ownApplication();
  }

  @GetMapping("/api/v1/admin/chef-applications")
  @PreAuthorize("hasAuthority('ROLE_SYSTEM_ADMIN')")
  public BaseResponse<PaginationResponse<ChefApplicationResponse>> list(
      @RequestParam(required = false) ChefApplicationStatus status,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "20") int size) {
    return facade.list(status, page, size);
  }

  @GetMapping("/api/v1/admin/chef-applications/{id}")
  @PreAuthorize("hasAuthority('ROLE_SYSTEM_ADMIN')")
  public BaseResponse<ChefApplicationResponse> detail(@PathVariable Long id) {
    return facade.detail(id);
  }

  @PatchMapping("/api/v1/admin/chef-applications/{id}/status")
  @PreAuthorize("hasAuthority('ROLE_SYSTEM_ADMIN')")
  public BaseResponse<ChefApplicationResponse> review(
      @PathVariable Long id, @Valid @RequestBody ChefReviewRequest request) {
    return facade.review(id, request);
  }
}
