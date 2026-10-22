package com.james.LMS.service.impl;

import com.james.LMS.entity.MenuAsset;
import com.james.LMS.repository.MenuAssetRepository;
import com.james.LMS.service.MenuAssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MenuAssetServiceImpl implements MenuAssetService {

    private final MenuAssetRepository menuAssetRepository;

    @Override
    public void save(MenuAsset menuAsset) {
        this.menuAssetRepository.save(menuAsset);
    }

}
