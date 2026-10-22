package com.james.LMS.repository;

import com.james.LMS.entity.MenuAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Set;

@Repository
public interface MenuAssetRepository extends JpaRepository<MenuAsset, Long> {
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
