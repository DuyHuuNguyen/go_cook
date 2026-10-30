package com.james.LMS.facade;

import com.james.LMS.request.AdminUserStatusRequest;
import com.james.LMS.response.AdminUserResponse;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.PaginationResponse;

public interface AdminUserFacade {
  BaseResponse<PaginationResponse<AdminUserResponse>> list(
      String keyword, String status, int page, int size);

  BaseResponse<AdminUserResponse> detail(Long id);

  BaseResponse<AdminUserResponse> updateStatus(Long id, AdminUserStatusRequest request);
}
