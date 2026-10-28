package com.james.LMS.facade;

import com.james.LMS.request.AdminMenuStatusRequest;
import com.james.LMS.request.AdminMenuUpdateRequest;
import com.james.LMS.request.MenuSearchRequest;
import com.james.LMS.response.AdminMenuResponse;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.PaginationResponse;

public interface AdminMenuFacade {
  BaseResponse<PaginationResponse<AdminMenuResponse>> list(
      MenuSearchRequest request, String status, Boolean isActive);

  BaseResponse<AdminMenuResponse> detail(Long id);

  BaseResponse<AdminMenuResponse> update(Long id, AdminMenuUpdateRequest request);

  BaseResponse<AdminMenuResponse> updateStatus(Long id, AdminMenuStatusRequest request);
}
