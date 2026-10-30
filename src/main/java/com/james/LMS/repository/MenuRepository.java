package com.james.LMS.repository;

import com.james.LMS.entity.Menu;
import com.james.LMS.response.MenuResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

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

    @EntityGraph(attributePaths = {"category", "seller"})
    Page<Menu> findAll(Specification<Menu> specification, Pageable pageable);

  @Query("""
  SELECT m
    from Menu m
    join fetch m.category c
    join fetch m.seller s
    where m.seller.id =:chefId
  """)
  Page<Menu> findAllByChefId(@Param("chefId") Long chefId, Pageable pageable);

  Optional<Menu> findByIdAndSeller_idAndIsActiveTrue(Long id, Long sellerId);

  @Query("""
   from Menu m
   left join fetch m.category c
    left join fetch m.dishes
    where m.seller.id =:chefId and m.id =:id and m.isActive
  """)
  Optional<Menu> findByIdAndChefIdAndIsActiveTrueAndFetchDishesAndCategory(
          @Param("id") Long id,@Param("chefId") Long chefId);

  @Query("""
  SELECT count(m) > 0
  from Menu m
  where m.seller.id =:chefId
  and m.id =:menuId
  """)
  Optional<Boolean> hasMenuByChefId(@Param("chefId") Long chefId,@Param("menuId") Long menuId);

  @EntityGraph(attributePaths = {"category", "seller"})
  List<Menu> findByIdGreaterThanAndSeller_IdOrderByIdAsc(Long lastMenuId, Long chefId);
}
