package com.james.LMS.service;

import com.james.LMS.dto.ChefProfileDTO;
import com.james.LMS.entity.ChefProfile;

import java.util.Optional;

public interface ChefProfileService {
    Optional<ChefProfileDTO> findChefProfileByUserId(Long userId);
}
