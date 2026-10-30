package com.james.LMS.service.impl;

import com.james.LMS.entity.MenuAsset;
import com.james.LMS.repository.MenuAssetRepository;
import com.james.LMS.service.MenuAssetService;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MenuAssetServiceImpl implements MenuAssetService {

  private final MenuAssetRepository menuAssetRepository;

  @Override
  public void save(MenuAsset menuAsset) {
    this.menuAssetRepository.save(menuAsset);
  }

  @Override
  public List<MenuAsset> findByLastAssetIdAndMenuId(Long lastId, Long menuId) {
    return this.menuAssetRepository.findByIdGreaterThanAndMenu_idAndIsActiveTrueOrderById(
        lastId, menuId, Limit.of(20));
  }

  @Override
  public Optional<MenuAsset> findByIdAndMenuId(Long assetId, Long menuId) {
    return this.menuAssetRepository.findByIdAndMenuId(assetId, menuId);
  }
}
