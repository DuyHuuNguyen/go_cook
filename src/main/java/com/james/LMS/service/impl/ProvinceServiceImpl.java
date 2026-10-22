package com.james.LMS.service.impl;

import com.james.LMS.entity.location.Province;
import com.james.LMS.repository.ProvinceRepository;
import com.james.LMS.service.ProvinceService;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProvinceServiceImpl implements ProvinceService {
  private final ProvinceRepository provinceRepository;

  @Override
  public List<Province> findAll() {
    return this.provinceRepository.findAll();
  }

  public Optional<Province> findByCode(String code) {
    return this.provinceRepository.findByCode(code);
  }
}
