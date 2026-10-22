package com.james.LMS.service;

import com.james.LMS.entity.Category;
import java.util.List;
import java.util.Optional;

public interface CategoryService {
  List<Category> findByIdGreaterThanOrderById(Long idIsGreaterThan);

  void save(Category category);

  Optional<Category> findById(Long id);
}
