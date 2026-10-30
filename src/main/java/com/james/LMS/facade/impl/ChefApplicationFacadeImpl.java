package com.james.LMS.facade.impl;

import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.enums.ChefApplicationStatus;
import com.james.LMS.facade.ChefApplicationFacade;
import com.james.LMS.request.ChefReviewRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ChefApplicationResponse;
import com.james.LMS.response.PaginationResponse;
import com.james.LMS.service.ChefApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChefApplicationFacadeImpl implements ChefApplicationFacade {
  private final ChefApplicationService service;

  public BaseResponse<ChefApplicationResponse> ownApplication() {
    return BaseResponse.build(
        service.ownApplication(SecurityUserDetails.getPrincipal().getId()), true);
  }

  public BaseResponse<PaginationResponse<ChefApplicationResponse>> list(
      ChefApplicationStatus status, int page, int size) {
    return BaseResponse.build(PaginationResponse.from(service.list(status, page, size)), true);
  }

  public BaseResponse<ChefApplicationResponse> detail(Long id) {
    return BaseResponse.build(service.detail(id), true);
  }

  public BaseResponse<ChefApplicationResponse> review(Long id, ChefReviewRequest request) {
    return BaseResponse.build(
        service.review(
            id,
            SecurityUserDetails.getPrincipal().getId(),
            request.getStatus(),
            request.getReason()),
        true);
  }
}
