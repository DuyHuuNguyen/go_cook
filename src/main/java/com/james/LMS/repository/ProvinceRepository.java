package com.james.LMS.repository;

import com.james.LMS.entity.location.Province;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProvinceRepository extends JpaRepository<Province, String> {

  Optional<Province> findByCode(String code);
}
