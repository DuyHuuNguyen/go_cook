package com.james.LMS.service;

import com.james.LMS.entity.location.Province;
import java.util.List;
import java.util.Optional;

public interface ProvinceService {
  List<Province> findAll();

  Optional<Province> findByCode(String code);
}
