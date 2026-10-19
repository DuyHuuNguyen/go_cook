package com.james.LMS.repository;

import com.james.LMS.entity.MenuDish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuDishRepository extends JpaRepository<MenuDish, Long> {}
