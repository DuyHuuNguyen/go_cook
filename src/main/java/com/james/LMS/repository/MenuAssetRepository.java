package com.james.LMS.repository;

import com.james.LMS.entity.MenuAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuAssetRepository extends JpaRepository<MenuAsset, Long> {}
