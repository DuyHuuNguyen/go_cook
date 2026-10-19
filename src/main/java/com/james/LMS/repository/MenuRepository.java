package com.james.LMS.repository;

import com.james.LMS.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

@Repository
public interface MenuRepository extends JpaRepository<Menu,Long> {
}
