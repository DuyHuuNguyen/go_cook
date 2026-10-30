package com.james.LMS.service.impl;

import com.james.LMS.repository.MenuDishRepository;
import com.james.LMS.service.MenuDishService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MenuDishServiceImpl implements MenuDishService {
  private final MenuDishRepository menuDishRepository;

  @Override
  public void deleteMenuDishes(List<Long> dishIds, Long menuId) {
    this.menuDishRepository.deleteByDishIdsAndMenuId(dishIds, menuId);
  }
}
