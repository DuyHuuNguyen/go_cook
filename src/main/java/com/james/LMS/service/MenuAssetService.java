package com.james.LMS.service;

import com.james.LMS.entity.MenuAsset;
import java.util.List;
import java.util.Optional;

public interface MenuAssetService {
  void save(MenuAsset menuAsset);

  List<MenuAsset> findByLastAssetIdAndMenuId(Long lastId, Long menuId);

  Optional<MenuAsset> findByIdAndMenuId(Long assetId, Long menuId);
}
