package com.james.LMS.repository;

import com.james.LMS.entity.Dish;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DishRepository extends JpaRepository<Dish, Long>, JpaSpecificationExecutor<Dish> {
  List<Dish> findByIdGreaterThanAndChef_IdAndIsActiveTrueOrderByIdAsc(
      Long id, Long chefId, Limit limit);

  List<Dish> findByIdGreaterThanAndIsActiveTrueOrderByIdAsc(Long id, Limit limit);

  List<Dish> findByIdGreaterThanAndChef_IdAndIsActiveTrueAndNameContainingIgnoreCaseOrderByIdAsc(
      Long id, Long chefId, String name, Limit limit);

  List<Dish> findByIdInAndIsActiveTrueAndChef_Id(List<Long> ids, Long chefId);

  List<Dish> findByIdInAndIsActiveTrue(List<Long> ids);

  Page<Dish> findByNameContainingIgnoreCaseAndIsActiveTrueOrderByNameAscIdAsc(
      String name, Pageable pageable);

  @Query("""
      select d.chef.id, d.id from Dish d
      where d.id in :dishIds and d.chef is not null and d.isActive = true
      """)
  List<Object[]> findOwnedDishChefIds(@Param("dishIds") List<Long> dishIds);

  @Query("""
      select d.chef.id, d.id, d.name from Dish d
      where d.chef.id in :chefIds and d.isActive = true
      order by d.id asc
      """)
  List<Object[]> findActiveDishesByChefIds(@Param("chefIds") List<Long> chefIds);

  @Query("""
      select cp.user.id, d.id, d.name
      from ChefProfile cp join cp.dishes d
      where cp.user.id in :chefIds and cp.isActive = true and d.isActive = true
      order by d.id asc
      """)
  List<Object[]> findProfileDishesByChefIds(@Param("chefIds") List<Long> chefIds);

  Optional<Dish> findByName(String name);
}
