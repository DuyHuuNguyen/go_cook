package com.james.LMS.repository;

import com.james.LMS.entity.MenuAsset;
import java.util.Collection;
import java.util.List;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuAssetRepository extends JpaRepository<MenuAsset, Long> {
  List<MenuAsset> findByMenuIdInAndIsActiveTrueOrderByIdAsc(Collection<Long> menuIds);




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
}
