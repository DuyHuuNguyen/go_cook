package com.james.LMS.service;

import com.james.LMS.request.AdminMenuUpdateRequest;
import com.james.LMS.request.MenuSearchRequest;
import com.james.LMS.response.AdminMenuResponse;
import org.springframework.data.domain.Page;

public interface AdminMenuService {
  Page<AdminMenuResponse> list(MenuSearchRequest request, String status, Boolean isActive);

  AdminMenuResponse detail(Long id);

  AdminMenuResponse update(Long id, AdminMenuUpdateRequest request);

  AdminMenuResponse updateStatus(Long id, Long actorId, Boolean isActive, String reason);
}
