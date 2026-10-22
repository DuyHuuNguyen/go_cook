package com.james.LMS.service;

import com.james.LMS.entity.location.Ward;
import java.util.List;
import java.util.Optional;

public interface WardService {
  List<Ward> findByFullNameLike(String fullName);

  Optional<Ward> findByCode(String code);
}
