package com.james.LMS.service.impl;

import com.james.LMS.entity.Dish;
import com.james.LMS.repository.DishRepository;
import com.james.LMS.service.DishService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DishServiceImpl implements DishService {

  private final DishRepository dishRepository;
  private static int LIMIT_DEFAULT = 20;

  @Override
  public List<Dish> findByIdGreaterThanOrderById(Long id, Long chefId) {
    return this.dishRepository.findByIdGreaterThanAndIsActiveTrueOrderByIdAsc(
        id, Limit.of(LIMIT_DEFAULT));
  }

  @Override
  public void save(Dish dish) {
    this.dishRepository.save(dish);
  }

  @Override
  public List<Dish> findByIds(List<Long> ids) {
    return this.dishRepository.findByIdInAndIsActiveTrue(ids);
  }
}
