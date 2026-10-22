package com.james.LMS.repository;

import com.james.LMS.entity.Menu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
  @EntityGraph(attributePaths = {"category", "seller"})
  @Query(
      value =
          "select m from Menu m where m.isActive = true and m.status in ('PUBLISHED', 'ACTIVE')",
      countQuery =
          "select count(m) from Menu m where m.isActive = true and m.status in ('PUBLISHED', 'ACTIVE')")
  Page<Menu> findListedMenus(Pageable pageable);
}
