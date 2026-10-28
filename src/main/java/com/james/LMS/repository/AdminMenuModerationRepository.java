package com.james.LMS.repository;

import com.james.LMS.entity.AdminMenuModeration;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdminMenuModerationRepository extends JpaRepository<AdminMenuModeration, Long> {
  Optional<AdminMenuModeration> findFirstByMenu_IdAndRestoredAtIsNullOrderByIdDesc(Long menuId);

  @Query("select a from AdminMenuModeration a where a.restoredAt is null and a.menu.id in :ids")
  List<AdminMenuModeration> findActiveForMenuIds(@Param("ids") Collection<Long> ids);
}
