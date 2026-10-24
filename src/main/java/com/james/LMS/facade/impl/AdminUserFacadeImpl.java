package com.james.LMS.facade.impl;

import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.facade.AdminUserFacade;
import com.james.LMS.request.AdminUserStatusRequest;
import com.james.LMS.response.AdminUserResponse;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.PaginationResponse;
import com.james.LMS.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUserFacadeImpl implements AdminUserFacade {
  private final AdminUserService service;

  public BaseResponse<PaginationResponse<AdminUserResponse>> list(
      String keyword, String status, int page, int size) {
    return BaseResponse.build(
        PaginationResponse.from(service.list(keyword, status, page, size)), true);
  }

  public BaseResponse<AdminUserResponse> detail(Long id) {
    return BaseResponse.build(service.detail(id), true);
  }

  public BaseResponse<AdminUserResponse> updateStatus(Long id, AdminUserStatusRequest request) {
    return BaseResponse.build(
        service.updateStatus(
            id,
            SecurityUserDetails.getPrincipal().getId(),
            request.getStatus(),
            request.getReason()),
        true);
  }
}
