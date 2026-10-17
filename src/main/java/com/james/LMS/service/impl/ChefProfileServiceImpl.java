package com.james.LMS.service.impl;

import com.james.LMS.dto.ChefProfileDTO;
import com.james.LMS.repository.ChefProfileRepository;
import com.james.LMS.service.ChefProfileService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChefProfileServiceImpl implements ChefProfileService {

    private final ChefProfileRepository chefProfileRepository;


    @Override
    public Optional<ChefProfileDTO> findChefProfileByUserId(Long userId) {
        return this.chefProfileRepository.findChefProfileByUserId(userId);
    }
}
