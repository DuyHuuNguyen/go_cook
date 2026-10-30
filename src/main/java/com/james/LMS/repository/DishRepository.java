package com.james.LMS.repository;

import com.james.LMS.entity.Dish;
import java.util.List;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface DishRepository extends JpaRepository<Dish, Long>, JpaSpecificationExecutor<Dish> {
  List<Dish> findByIdGreaterThanAndChef_IdAndIsActiveTrueOrderByIdAsc(
      Long id, Long chefId, Limit limit);

  List<Dish> findByIdGreaterThanAndChef_IdAndIsActiveTrueAndNameContainingIgnoreCaseOrderByIdAsc(
      Long id, Long chefId, String name, Limit limit);

  List<Dish> findByIdInAndIsActiveTrueAndChef_Id(List<Long> ids, Long chefId);

  List<Dish> findByIdInAndIsActiveTrue(List<Long> ids);

  Page<Dish> findByNameContainingIgnoreCaseAndIsActiveTrueOrderByNameAscIdAsc(
      String name, Pageable pageable);
}
