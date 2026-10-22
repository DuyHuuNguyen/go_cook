package com.james.LMS.service;

import com.james.LMS.entity.Menu;
import com.james.LMS.request.MenuSearchRequest;
import com.james.LMS.response.MenuResponse;
import org.springframework.data.domain.Page;

import java.util.Optional;

public interface MenuService {
  void save(Menu menu);

  Optional<Menu> findByIdAndChefId(Long id,Long chefId);

    Page<MenuResponse> findMenus(MenuSearchRequest request);

}
