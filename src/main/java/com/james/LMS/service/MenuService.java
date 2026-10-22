package com.james.LMS.service;

import com.james.LMS.entity.Menu;
import com.james.LMS.request.MenuSearchRequest;
import com.james.LMS.response.MenuResponse;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface MenuService {
  void save(Menu menu);

  Optional<Menu> findByIdAndChefId(Long id, Long chefId);

  Page<MenuResponse> findMenus(MenuSearchRequest request);
}
