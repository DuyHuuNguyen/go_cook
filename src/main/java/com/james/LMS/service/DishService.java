package com.james.LMS.service;

import com.james.LMS.entity.Dish;
import java.util.List;

public interface DishService {
  List<Dish> findByIdGreaterThanOrderById(Long id, Long chefId);

  void save(Dish dish);

  List<Dish> findByIds(List<Long> ids, Long chefId);
}
