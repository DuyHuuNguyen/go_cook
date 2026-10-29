package com.james.LMS.service;

import com.james.LMS.response.AdminDishResponse;
import org.springframework.data.domain.Page;

public interface AdminDishService {
  Page<AdminDishResponse> list(
      String keyword,
      Boolean isActive,
      String ownership,
      Long chefId,
      int page,
      int size,
      String sortBy,
      String sortDirection);

  AdminDishResponse detail(Long id);

  AdminDishResponse update(Long id, String name);

  AdminDishResponse updateStatus(Long id, Long actorId, Boolean isActive, String reason);
}
