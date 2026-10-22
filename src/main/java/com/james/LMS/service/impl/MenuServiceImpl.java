package com.james.LMS.service.impl;

import com.james.LMS.entity.MenuAsset;
import com.james.LMS.repository.MenuAssetRepository;
import com.james.LMS.repository.MenuDishRepository;
import com.james.LMS.repository.MenuRepository;
import com.james.LMS.response.MenuResponse;
import com.james.LMS.service.MenuService;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuServiceImpl implements MenuService {
  private final MenuRepository menuRepository;
  private final MenuDishRepository menuDishRepository;
  private final MenuAssetRepository menuAssetRepository;

  @Override
  public Page<MenuResponse> findMenus(int page, int size) {
    if (page < 0 || size < 1 || size > 100) {
      throw new IllegalArgumentException("page must be >= 0 and size must be between 1 and 100");
    }
    // Page only the aggregate roots: fetching a collection here would break SQL pagination.
    var menus =
        menuRepository.findListedMenus(PageRequest.of(page, size, Sort.by("id").descending()));
    if (menus.isEmpty()) {
      return new PageImpl<>(List.of(), menus.getPageable(), menus.getTotalElements());
    }
    var ids = menus.getContent().stream().map(menu -> menu.getId()).toList();
    var dishes =
        menuDishRepository.findListedDishes(ids).stream()
            .collect(
                Collectors.groupingBy(
                    md -> md.getMenu().getId(),
                    Collectors.mapping(
                        md ->
                            new MenuResponse.DishSummary(
                                md.getDish().getId(), md.getDish().getName()),
                        Collectors.toList())));
    var images =
        menuAssetRepository.findByMenuIdInAndIsActiveTrueOrderByIdAsc(ids).stream()
            .collect(
                Collectors.groupingBy(
                    asset -> asset.getMenu().getId(),
                    Collectors.mapping(MenuAsset::getUrl, Collectors.toList())));
    return menus.map(
        menu ->
            new MenuResponse(
                menu.getId(),
                menu.getName(),
                menu.getDescription(),
                menu.getTempPrice(),
                menu.getMinGuests(),
                menu.getMaxGuests(),
                menu.getStatus(),
                new MenuResponse.CategorySummary(
                    menu.getCategory().getId(), menu.getCategory().getName()),
                new MenuResponse.SellerSummary(
                    menu.getSeller().getId(),
                    menu.getSeller().getUsername(),
                    menu.getSeller().getAvatarUrl()),
                dishes.getOrDefault(menu.getId(), List.of()),
                images.getOrDefault(menu.getId(), List.of())));
  }
}
