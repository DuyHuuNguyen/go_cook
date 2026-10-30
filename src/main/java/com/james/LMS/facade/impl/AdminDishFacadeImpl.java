package com.james.LMS.facade.impl;

import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.facade.AdminDishFacade;
import com.james.LMS.request.AdminDishStatusRequest;
import com.james.LMS.request.AdminDishUpdateRequest;
import com.james.LMS.response.AdminDishResponse;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.PaginationResponse;
import com.james.LMS.service.AdminDishService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminDishFacadeImpl implements AdminDishFacade {
  private final AdminDishService service;

  @Override
  public BaseResponse<PaginationResponse<AdminDishResponse>> list(
      String keyword,
      Boolean isActive,
      String ownership,
      Long chefId,
      int page,
      int size,
      String sortBy,
      String sortDirection) {
    return BaseResponse.build(
        PaginationResponse.from(
            service.list(keyword, isActive, ownership, chefId, page, size, sortBy, sortDirection)),
        true);
  }

  @Override
  public BaseResponse<AdminDishResponse> detail(Long id) {
    return BaseResponse.build(service.detail(id), true);
  }

  @Override
  public BaseResponse<AdminDishResponse> update(Long id, AdminDishUpdateRequest request) {
    return BaseResponse.build(service.update(id, request.getName()), true);
  }

  @Override
  public BaseResponse<AdminDishResponse> updateStatus(Long id, AdminDishStatusRequest request) {
    return BaseResponse.build(
        service.updateStatus(
            id,
            SecurityUserDetails.getPrincipal().getId(),
            request.getIsActive(),
            request.getReason()),
        true);
  }
}
