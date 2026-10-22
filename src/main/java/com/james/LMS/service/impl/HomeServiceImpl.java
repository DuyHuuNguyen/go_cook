package com.james.LMS.service.impl;

import com.james.LMS.entity.Menu;
import com.james.LMS.repository.CategoryRepository;
import com.james.LMS.repository.ChefProfileRepository;
import com.james.LMS.repository.MenuAssetRepository;
import com.james.LMS.repository.MenuRepository;
import com.james.LMS.response.HomeResponse;
import com.james.LMS.service.HomeService;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HomeServiceImpl implements HomeService {

  private final CategoryRepository categoryRepository;
  private final ChefProfileRepository chefProfileRepository;
  private final MenuRepository menuRepository;
  private final MenuAssetRepository menuAssetRepository;

  @Override
  @Transactional(readOnly = true)
  public HomeResponse getHome() {
    var categories =
        categoryRepository.findAllByIsActiveTrueOrderByNameAsc().stream()
            .map(category -> new HomeResponse.CategoryItem(category.getId(), category.getName()))
            .toList();

    var menus = menuRepository.findPublicMenus(PageRequest.of(0, 24));
    Set<Long> menuIds = menus.stream().map(Menu::getId).collect(Collectors.toSet());
    Map<Long, String> images =
        menuIds.isEmpty()
            ? Map.of()
            : menuAssetRepository.findImagesForMenus(menuIds).stream()
                .collect(
                    Collectors.toMap(
                        MenuAssetRepository.MenuImage::getMenuId,
                        MenuAssetRepository.MenuImage::getUrl,
                        (first, ignored) -> first));

    var menuItems =
        menus.stream()
            .map(
                menu ->
                    new HomeResponse.MenuItem(
                        menu.getId(),
                        menu.getName(),
                        menu.getDescription(),
                        menu.getTempPrice(),
                        menu.getMinGuests(),
                        menu.getMaxGuests(),
                        menu.getCategory().getId(),
                        menu.getCategory().getName(),
                        menu.getSeller().getId(),
                        menu.getSeller().getUsername(),
                        images.get(menu.getId())))
            .toList();

    var chefs =
        chefProfileRepository.findPublicChefs(PageRequest.of(0, 6)).stream()
            .map(
                chef ->
                    new HomeResponse.ChefItem(
                        chef.getUser().getId(),
                        chef.getUser().getUsername(),
                        chef.getUser().getAvatarUrl(),
                        chef.getBio(),
                        chef.getExperienceYears()))
            .toList();

    return new HomeResponse(categories, menuItems, chefs);
  }
}
