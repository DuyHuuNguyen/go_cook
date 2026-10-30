package com.james.LMS.service.impl;

import com.james.LMS.entity.Dish;
import com.james.LMS.repository.DishRepository;
import com.james.LMS.service.DishService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DishServiceImpl implements DishService {

  private final DishRepository dishRepository;
  private static final int LIMIT_DEFAULT = 20;

  //  @Override
  //  public List<Dish> findByIdGreaterThanOrderById(Long id, Long chefId) {
  //    return this.dishRepository.findByIdGreaterThanAndIsActiveTrueOrderByIdAsc(
  //        id, Limit.of(LIMIT_DEFAULT));
  //  }

  @Override
  public List<Dish> findByIdGreaterThanOrderById(Long id, Long chefId, String name) {
    if (name != null && !name.isBlank()) {
      return this.dishRepository
          .findByIdGreaterThanAndChef_IdAndIsActiveTrueAndNameContainingIgnoreCaseOrderByIdAsc(
              id, chefId, name.trim(), Limit.of(LIMIT_DEFAULT));
    }
    return this.dishRepository.findByIdGreaterThanAndChef_IdAndIsActiveTrueOrderByIdAsc(
        id, chefId, Limit.of(LIMIT_DEFAULT));
  }

  @Override
  public Page<Dish> searchByName(String name, Pageable pageable) {
    return dishRepository.findByNameContainingIgnoreCaseAndIsActiveTrueOrderByNameAscIdAsc(
        name.trim(), pageable);
  }

  @Override
  public void save(Dish dish) {
    this.dishRepository.save(dish);
  }

  @Override
  public List<Dish> findByIds(List<Long> ids, Long chefId) {
    return this.dishRepository.findByIdInAndIsActiveTrueAndChef_Id(ids, chefId);
  }

  @Override
  public List<Dish> findByIds(List<Long> ids) {
    return this.dishRepository.findByIdInAndIsActiveTrue(ids);
  }
}
