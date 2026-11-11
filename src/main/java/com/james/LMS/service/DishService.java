package com.james.LMS.service;

import com.james.LMS.dto.DishDTO;
import com.james.LMS.entity.Dish;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DishService {
  List<Dish> findByIdGreaterThanOrderById(Long id, Long chefId, String name);

  Page<Dish> searchByName(String name, Pageable pageable);

  void save(Dish dish);

  List<Dish> findByIds(List<Long> ids, Long chefId);

  List<Dish> findByIds(List<Long> ids);

  Map<Long, List<DishDTO>> findDishesByChefIds(List<Long> chefIds);
}
