package com.james.LMS.service;

import com.james.LMS.entity.Menu;

import java.util.Optional;

public interface MenuService {
  void save(Menu menu);

  Optional<Menu> findByIdAndChefId(Long id,Long chefId);

}
