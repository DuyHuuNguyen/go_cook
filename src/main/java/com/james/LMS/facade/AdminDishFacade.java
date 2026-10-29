package com.james.LMS.facade;

import com.james.LMS.request.AdminDishStatusRequest;
import com.james.LMS.request.AdminDishUpdateRequest;
import com.james.LMS.response.AdminDishResponse;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.PaginationResponse;

public interface AdminDishFacade {
  BaseResponse<PaginationResponse<AdminDishResponse>> list(
      String keyword,
      Boolean isActive,
      String ownership,
      Long chefId,
      int page,
      int size,
      String sortBy,
      String sortDirection);

  BaseResponse<AdminDishResponse> detail(Long id);

  BaseResponse<AdminDishResponse> update(Long id, AdminDishUpdateRequest request);

  BaseResponse<AdminDishResponse> updateStatus(Long id, AdminDishStatusRequest request);
}
