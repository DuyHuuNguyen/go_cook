package com.james.LMS.service;

import com.james.LMS.enums.ChefApplicationStatus;
import com.james.LMS.request.BecomeChefRequest;
import com.james.LMS.response.ChefApplicationResponse;
import org.springframework.data.domain.Page;

public interface ChefApplicationService {
  void submit(Long userId, BecomeChefRequest request);

  ChefApplicationResponse ownApplication(Long userId);

  ChefApplicationResponse detail(Long id);

  Page<ChefApplicationResponse> list(ChefApplicationStatus status, int page, int size);

  ChefApplicationResponse review(
      Long id, Long actorId, ChefApplicationStatus status, String reason);

  void requireApprovedSeller(Long userId);
}
