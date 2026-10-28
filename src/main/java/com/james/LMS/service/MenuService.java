package com.james.LMS.service;

import com.james.LMS.entity.Menu;
import com.james.LMS.request.MenuSearchRequest;
import com.james.LMS.response.MenuResponse;

import java.util.List;
import java.util.Optional;

import com.opencsv.bean.CsvToBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MenuService {
  void save(Menu menu);

  Optional<Menu> findByIdAndChefId(Long id, Long chefId);

  Page<MenuResponse> findMenus(MenuSearchRequest request);

  Page<MenuResponse> findAllMenuByChefId(Long chefId, Pageable pageable);

  List<MenuResponse> findByIdGreaterThanOrderByChefId(Long lastMenuId, Long chefId);
}
