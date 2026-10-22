package com.james.LMS.service;

import com.james.LMS.request.MenuSearchRequest;
import com.james.LMS.response.MenuResponse;
import org.springframework.data.domain.Page;

public interface MenuService {
  Page<MenuResponse> findMenus(MenuSearchRequest request);
}
