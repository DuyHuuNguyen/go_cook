package com.james.LMS.service;

import com.james.LMS.response.AdminUserResponse;
import org.springframework.data.domain.Page;

public interface AdminUserService {
  Page<AdminUserResponse> list(String keyword, String status, int page, int size);

  AdminUserResponse detail(Long id);

  AdminUserResponse updateStatus(Long id, Long actorId, String status, String reason);
}
