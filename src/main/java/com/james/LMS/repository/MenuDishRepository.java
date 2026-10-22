package com.james.LMS.repository;

import com.james.LMS.entity.MenuDish;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuDishRepository extends JpaRepository<MenuDish, Long> {
  @Query(
      """
      select md 
      from MenuDish md 
      join fetch md.dish d 
      where md.menu.id in :menuIds and md.isActive = true and d.isActive = true 
      order by md.id
      """)
  List<MenuDish> findListedDishes(@Param("menuIds") Collection<Long> menuIds);
}
