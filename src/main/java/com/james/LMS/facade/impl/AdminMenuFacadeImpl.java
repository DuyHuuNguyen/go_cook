package com.james.LMS.facade.impl;

import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.facade.AdminMenuFacade;
import com.james.LMS.request.AdminMenuStatusRequest;
import com.james.LMS.request.AdminMenuUpdateRequest;
import com.james.LMS.request.MenuSearchRequest;
import com.james.LMS.response.AdminMenuResponse;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.PaginationResponse;
import com.james.LMS.service.AdminMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminMenuFacadeImpl implements AdminMenuFacade {
  private final AdminMenuService service;

  @Override
  public BaseResponse<PaginationResponse<AdminMenuResponse>> list(
      MenuSearchRequest request, String status, Boolean isActive) {
    return BaseResponse.build(
        PaginationResponse.from(service.list(request, status, isActive)), true);
  }

  @Override
  public BaseResponse<AdminMenuResponse> detail(Long id) {
    return BaseResponse.build(service.detail(id), true);
  }

  @Override
  public BaseResponse<AdminMenuResponse> update(Long id, AdminMenuUpdateRequest request) {
    return BaseResponse.build(service.update(id, request), true);
  }

  @Override
  public BaseResponse<AdminMenuResponse> updateStatus(Long id, AdminMenuStatusRequest request) {
    return BaseResponse.build(
        service.updateStatus(
            id,
            SecurityUserDetails.getPrincipal().getId(),
            request.getIsActive(),
            request.getReason()),
        true);
  }
}
