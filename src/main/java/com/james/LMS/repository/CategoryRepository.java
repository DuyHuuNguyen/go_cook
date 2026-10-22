package com.james.LMS.repository;

import com.james.LMS.entity.Category;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
  List<Category> findAllByIsActiveTrueOrderByNameAsc();

  List<Category> findByIdGreaterThanOrderById(Long id, Limit limit);

  Optional<Category> findByIdAndIsActiveTrue(Long id);
}
