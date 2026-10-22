package com.james.LMS.service.impl;

import com.james.LMS.entity.location.Ward;
import com.james.LMS.repository.WardRepository;
import com.james.LMS.service.WardService;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WardServiceImpl implements WardService {
  private final WardRepository wardRepository;

  @Override
  public List<Ward> findByFullNameLike(String fullName) {
    return this.wardRepository.findByFullNameContaining(fullName, PageRequest.of(0, 20));
  }

  @Override
  public Optional<Ward> findByCode(String code) {
    return this.wardRepository.findByCode(code);
  }
}
