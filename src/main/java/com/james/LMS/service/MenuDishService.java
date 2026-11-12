package com.james.LMS.service;

import java.util.List;

public interface MenuDishService {
  void deleteMenuDishes(List<Long> dishIds, Long menuId);
}
