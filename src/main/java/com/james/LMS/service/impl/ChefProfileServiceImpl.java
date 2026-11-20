package com.james.LMS.service.impl;

import com.james.LMS.dto.ChefProfileDTO;
import com.james.LMS.repository.ChefProfileRepository;
import com.james.LMS.service.ChefProfileService;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChefProfileServiceImpl implements ChefProfileService {

  private final ChefProfileRepository chefProfileRepository;

  @Override
  public Optional<ChefProfileDTO> findChefProfileByUserId(Long userId) {
    return this.chefProfileRepository.findChefProfileByUserId(userId);
  }

  @Override
  @Transactional(readOnly = true)
  public List<ServiceAreaInfo> findActiveServiceAreasByChefUserId(Long chefId) {
    if (chefId == null) {
      return List.of();
    }
    return this.chefProfileRepository.findActiveServiceAreasByChefUserId(chefId).stream()
        .map(
            row ->
                new ServiceAreaInfo(
                    (String) row[0], (String) row[1], (String) row[2], (String) row[3]))
        .toList();
  }
}
