package com.james.LMS.repository;

import com.james.LMS.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
  // Join-fetch only many-to-one relations, so the Pageable limit remains accurate.
  @Query("""
      select m from Menu m
      join fetch m.category c
      join fetch m.seller s
      where m.isActive = true and c.isActive = true and s.isActive = true
        and upper(coalesce(m.status, '')) in ('ACTIVE', 'PUBLISHED', 'APPROVED', 'AVAILABLE')
      order by m.updatedAt desc, m.id desc
      """)
  List<Menu> findPublicMenus(Pageable pageable);
}
