package com.james.LMS.repository;

import com.james.LMS.entity.Dish;
import java.util.List;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DishRepository extends JpaRepository<Dish, Long> {
  List<Dish> findByIdGreaterThanAndChef_IdAndIsActiveTrueOrderByIdAsc(
      Long id, Long chefId, Limit limit);

  List<Dish> findByIdInAndIsActiveTrueAndChef_Id(List<Long> ids, Long chefId);
}
