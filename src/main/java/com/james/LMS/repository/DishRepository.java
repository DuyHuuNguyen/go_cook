package com.james.LMS.repository;

import com.james.LMS.entity.Dish;
import java.util.List;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DishRepository extends JpaRepository<Dish, Long> {
  List<Dish> findByIdGreaterThanAndIsActiveTrueOrderByIdAsc(
      Long id, Limit limit);

  List<Dish> findByIdInAndIsActiveTrue(List<Long> ids);
}
