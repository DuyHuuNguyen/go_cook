package com.james.LMS.repository;

import com.james.LMS.entity.AdminDishModeration;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdminDishModerationRepository extends JpaRepository<AdminDishModeration, Long> {
  Optional<AdminDishModeration> findFirstByDish_IdAndRestoredAtIsNullOrderByIdDesc(Long dishId);

  @Query("select a from AdminDishModeration a where a.restoredAt is null and a.dish.id in :ids")
  List<AdminDishModeration> findActiveForDishIds(@Param("ids") Collection<Long> ids);
}
