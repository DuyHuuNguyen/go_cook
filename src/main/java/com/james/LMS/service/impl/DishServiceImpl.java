package com.james.LMS.service.impl;

import com.james.LMS.dto.DishDTO;
import com.james.LMS.entity.Dish;
import com.james.LMS.repository.DishRepository;
import com.james.LMS.service.DishService;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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

  @Override
  public Map<Long, List<DishDTO>> findDishesByChefIds(List<Long> chefIds) {
    if (chefIds == null || chefIds.isEmpty()) {
      return Map.of();
    }
    Map<Long, Map<Long, DishDTO>> deduplicatedByChef = new HashMap<>();
    collectDishes(this.dishRepository.findActiveDishesByChefIds(chefIds), deduplicatedByChef);
    collectDishes(this.dishRepository.findProfileDishesByChefIds(chefIds), deduplicatedByChef);

    Map<Long, List<DishDTO>> result = new HashMap<>();
    deduplicatedByChef.forEach(
        (chefId, dishMap) -> result.put(chefId, new ArrayList<>(dishMap.values())));
    return result;
  }

  private void collectDishes(
      List<Object[]> rows, Map<Long, Map<Long, DishDTO>> deduplicatedByChef) {
    for (Object[] row : rows) {
      Long chefId = (Long) row[0];
      Long dishId = (Long) row[1];
      String dishName = (String) row[2];
      deduplicatedByChef
          .computeIfAbsent(chefId, ignored -> new LinkedHashMap<>())
          .putIfAbsent(dishId, DishDTO.builder().id(dishId).name(dishName).build());
    }
  }
}
