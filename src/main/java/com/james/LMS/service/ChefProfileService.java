package com.james.LMS.service;

import com.james.LMS.dto.ChefProfileDTO;
import java.util.List;
import java.util.Optional;

public interface ChefProfileService {
  record ServiceAreaInfo(
      String provinceCode, String provinceName, String wardCode, String wardName) {}

  Optional<ChefProfileDTO> findChefProfileByUserId(Long userId);

  List<ServiceAreaInfo> findActiveServiceAreasByChefUserId(Long chefId);
}
