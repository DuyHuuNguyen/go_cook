package com.james.LMS.service.impl;

import com.james.LMS.entity.Menu;
import com.james.LMS.repository.MenuRepository;
import com.james.LMS.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MenuServiceImpl implements MenuService {
  private final MenuRepository menuRepository;

  @Override
  public void save(Menu menu) {
    this.menuRepository.save(menu);
  }

  @Override
  public Optional<Menu> findByIdAndChefId(Long id, Long chefId) {
    return this.menuRepository.findByIdAndSeller_idAndIsActiveTrue(id,  chefId);
  }
}
