package com.james.LMS.repository;

import com.james.LMS.entity.Category;
import com.james.LMS.entity.MenuAsset;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuAssetRepository extends JpaRepository<MenuAsset, Long> {
  List<MenuAsset> findByMenuIdInAndIsActiveTrueOrderByIdAsc(Collection<Long> menuIds);


    List<MenuAsset> findByIdGreaterThanAndMenu_idAndIsActiveTrueOrderById(@Param("id") Long id,@Param("menuId")Long menuId, Limit limit);


    interface MenuImage {
        Long getMenuId();
        String getUrl();
    }

    @Query("""
      select a.menu.id as menuId, a.url as url
      from MenuAsset a
      where a.isActive = true and a.menu.id in :menuIds
      order by a.id asc
      """)
    List<MenuImage> findImagesForMenus(@Param("menuIds") Set<Long> menuIds);


    @Query("""
    SELECT a
    FROM MenuAsset a
    WHERE a.menu.id = :menuId
      AND a.id = :assetId
    """)
    Optional<MenuAsset> findByIdAndMenuId(
            @Param("assetId") Long assetId,
            @Param("menuId") Long menuId
    );
}
