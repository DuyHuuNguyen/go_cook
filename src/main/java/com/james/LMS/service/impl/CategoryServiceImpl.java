package com.james.LMS.service.impl;

import com.james.LMS.repository.CategoryRepository;
import com.james.LMS.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
  private final CategoryRepository categoryRepository;
}
