package com.james.LMS.repository;

import com.james.LMS.entity.Menu;
import com.james.LMS.enums.ChefApplicationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
  // Join-fetch only many-to-one relations, so the Pageable limit remains accurate.
  @Query("""
      select m from Menu m
      join fetch m.category c
      join fetch m.seller s
      join s.chefProfile cp
      where m.isActive = true and c.isActive = true and s.isActive = true
        and cp.isActive = true and cp.reviewStatus = :approvedStatus
        and upper(coalesce(m.status, '')) in ('ACTIVE', 'PUBLISHED', 'APPROVED', 'AVAILABLE')
      order by m.updatedAt desc, m.id desc
      """)
  List<Menu> findPublicMenus(
      Pageable pageable, @Param("approvedStatus") ChefApplicationStatus approvedStatus);

  @EntityGraph(attributePaths = {"category", "seller"})
  Page<Menu> findAll(Specification<Menu> specification, Pageable pageable);

  Optional<Menu> findByIdAndSeller_idAndIsActiveTrue(Long id, Long sellerId);
}
