package com.james.LMS.facade;

import com.james.LMS.enums.ChefApplicationStatus;
import com.james.LMS.request.ChefReviewRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ChefApplicationResponse;
import com.james.LMS.response.PaginationResponse;

public interface ChefApplicationFacade {
  BaseResponse<ChefApplicationResponse> ownApplication();

  BaseResponse<PaginationResponse<ChefApplicationResponse>> list(
      ChefApplicationStatus status, int page, int size);

  BaseResponse<ChefApplicationResponse> detail(Long id);

  BaseResponse<ChefApplicationResponse> review(Long id, ChefReviewRequest request);
}
