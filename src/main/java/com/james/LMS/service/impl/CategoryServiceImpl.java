package com.james.LMS.service.impl;

import com.james.LMS.entity.Category;
import com.james.LMS.repository.CategoryRepository;
import com.james.LMS.service.CategoryService;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
  private final CategoryRepository categoryRepository;
  private static int DEFAULT_LIMIT = 20;

  @Override
  public List<Category> findByIdGreaterThanOrderById(Long idIsLessThan) {
    return this.categoryRepository.findByIdGreaterThanOrderById(
        idIsLessThan, Limit.of(DEFAULT_LIMIT));
  }

  @Override
  public void save(Category category) {
    this.categoryRepository.save(category);
  }

  @Override
  public Optional<Category> findById(Long id) {
    return this.categoryRepository.findByIdAndIsActiveTrue(id);
  }
}
