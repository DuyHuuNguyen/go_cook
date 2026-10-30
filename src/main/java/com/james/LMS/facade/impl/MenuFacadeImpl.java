package com.james.LMS.facade.impl;

import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.dto.ModificationMenuDTO;
import com.james.LMS.entity.*;
import com.james.LMS.enums.ErrorCode;
import com.james.LMS.enums.FileType;
import com.james.LMS.exception.EntityNotFoundException;
import com.james.LMS.exception.PermissionDeniedException;
import com.james.LMS.exception.UploadFileException;
import com.james.LMS.facade.MenuFacade;
import com.james.LMS.request.MenuOfChefRequest;
import com.james.LMS.request.MenuSearchRequest;
import com.james.LMS.request.UpsetMenuAssetRequest;
import com.james.LMS.request.UpsetMenuRequest;
import com.james.LMS.response.*;
import com.james.LMS.service.*;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuFacadeImpl implements MenuFacade {
  private final MenuService menuService;
  private final MenuDishService menuDishService;
  private final UserService userService;
  private final DishService dishService;
  private final CategoryService categoryService;
  private final CloudinaryService cloudinaryService;
  private final MenuAssetService menuAssetService;

  @Override
  public BaseResponse<PaginationResponse<MenuResponse>> findMenus(MenuSearchRequest request) {
    return BaseResponse.build(PaginationResponse.from(menuService.findMenus(request)), true);
  }

  @Override
  @Transactional
  public BaseResponse<Void> createMenu(UpsetMenuRequest request) {
    SecurityUserDetails principal = SecurityUserDetails.getPrincipal();

    User chef =
        this.userService
            .findById(principal.getId())
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));

    Menu menu =
        Menu.builder()
            .name(request.getName())
            .tempPrice(request.getTempPrice())
            .minGuests(request.getMinGuests())
            .maxGuests(request.getMaxGuests())
            .description(request.getDescription())
            .status(request.getStatus())
            .seller(chef)
            .build();

    Category category =
        this.categoryService
            .findById(request.getCategoryId())
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.CATEGORY_NOT_FOUND));

    menu.addCategory(category);
    List<Dish> dishes = this.dishService.findByIds(request.getDishIds());

    dishes.forEach(menu::addDish);

    this.menuService.save(menu);

    return BaseResponse.ok();
  }

  @Override
  @Transactional
  public BaseResponse<Void> addMenuAssets(UpsetMenuAssetRequest request) {
    SecurityUserDetails principal = SecurityUserDetails.getPrincipal();

    Menu menu =
        menuService
            .findByIdAndChefId(request.getMenuId(), principal.getId())
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.MENU_NOT_FOUND));

    byte[] imageBytes;
    try {
      imageBytes = request.getFile().getBytes();
    } catch (IOException ioException) {
      throw new UploadFileException(ErrorCode.FILE_ERROR_UPLOAD);
    }
    String url = cloudinaryService.uploadFile(imageBytes, FileType.IMAGE);

    menuAssetService.save(MenuAsset.builder().url(url).menu(menu).build());
    return BaseResponse.ok();
  }

  @Override
  public BaseResponse<PaginationResponse<MenuResponse>> findAllMenuOfChef(
      MenuOfChefRequest request) {
    var principle = SecurityUserDetails.getPrincipal();
    Pageable pageable = PageRequest.of(request.getCurrentPage() - 1, request.getPageSize());
    return BaseResponse.build(
        PaginationResponse.from(menuService.findAllMenuByChefId(principle.getId(), pageable)),
        true);
  }

  @Override
  public BaseResponse<KeySetPaginationResponse<MenuResponse>> findByLastId(Long lastId) {
    SecurityUserDetails principal = SecurityUserDetails.getPrincipal();

    List<MenuResponse> menuResponses =
        this.menuService.findByIdGreaterThanOrderByChefId(lastId, principal.getId());

    boolean hasNext = !menuResponses.isEmpty();
    lastId = hasNext ? menuResponses.getLast().id() : -1l;

    var paginationResponse =
        KeySetPaginationResponse.<MenuResponse>builder()
            .data(menuResponses)
            .lastId(lastId)
            .hasNext(hasNext)
            .build();
    return BaseResponse.build(paginationResponse, true);
  }

  @Override
  public BaseResponse<KeySetPaginationResponse<MenuAssetResponse>> findAllAssets(
      Long menuId, Long lastAssetId) {

    if (menuId < 0 || lastAssetId < 0) {
      throw new PermissionDeniedException(ErrorCode.MENU_NOT_FOUND);
    }

    var principle = SecurityUserDetails.getPrincipal();

    boolean hasMenu =
        this.menuService
            .hasMenuByChefId(principle.getId(), menuId)
            .orElseThrow(() -> new PermissionDeniedException(ErrorCode.MENU_NOT_FOUND));

    if (!hasMenu) {
      throw new PermissionDeniedException(ErrorCode.MENU_NOT_FOUND);
    }

    List<MenuAssetResponse> menuAssetResponses =
        this.menuAssetService.findByLastAssetIdAndMenuId(lastAssetId, menuId).stream()
            .map(
                menuAsset ->
                    MenuAssetResponse.builder()
                        .id(menuAsset.getId())
                        .url(menuAsset.getUrl())
                        .build())
            .toList();

    boolean hasNext = !menuAssetResponses.isEmpty();
    long lastId = hasNext ? -1l : menuAssetResponses.getLast().getId();

    KeySetPaginationResponse<MenuAssetResponse> response =
        KeySetPaginationResponse.<MenuAssetResponse>builder()
            .lastId(lastId)
            .data(menuAssetResponses)
            .hasNext(hasNext)
            .build();

    return BaseResponse.build(response, true);
  }

  @Override
  @Transactional
  public BaseResponse<Void> removeMenuAsset(Long menuId, Long assetId) {
    if (menuId < 0 || assetId < 0) {
      throw new PermissionDeniedException(ErrorCode.MENU_NOT_FOUND);
    }

    var principle = SecurityUserDetails.getPrincipal();

    boolean hasMenu =
        this.menuService
            .hasMenuByChefId(principle.getId(), menuId)
            .orElseThrow(() -> new PermissionDeniedException(ErrorCode.MENU_NOT_FOUND));

    if (!hasMenu) {
      throw new PermissionDeniedException(ErrorCode.MENU_NOT_FOUND);
    }

    MenuAsset menuAsset =
        this.menuAssetService
            .findByIdAndMenuId(assetId, menuId)
            .orElseThrow(() -> new PermissionDeniedException(ErrorCode.MENU_NOT_FOUND));

    menuAsset.softDelete();
    menuAssetService.save(menuAsset);
    return BaseResponse.ok();
  }

  @Override
  @Transactional
  public BaseResponse<Void> editMenu(UpsetMenuRequest request) {
    log.info(request.toString());
    var principle = SecurityUserDetails.getPrincipal();

    log.info("menuId = {}  chefId={}", request.getId(), principle.getId());
    Menu menu =
        this.menuService
            .findByIdAndChefIdAndFetchDishesAndCategory(request.getId(), principle.getId())
            .orElseThrow(() -> new PermissionDeniedException(ErrorCode.MENU_NOT_FOUND));

    ModificationMenuDTO modificationMenuDTO =
        ModificationMenuDTO.builder()
            .name(request.getName())
            .tempPrice(request.getTempPrice())
            .minGuests(request.getMinGuests())
            .maxGuests(request.getMaxGuests())
            .description(request.getDescription())
            .status(request.getStatus())
            .build();

    menu.changeInfo(modificationMenuDTO);

    boolean isChangeCategory =
        request.getCategoryId() != null
            && !menu.getCategory().getId().equals(request.getCategoryId());

    if (isChangeCategory) {
      Category category =
          this.categoryService
              .findById(request.getCategoryId())
              .orElseThrow(() -> new EntityNotFoundException(ErrorCode.CATEGORY_NOT_FOUND));
      menu.addCategory(category);
    }

    if (!request.getDishIds().isEmpty()) {
      List<Dish> deletableDishes =
          menu.getDishes().stream()
              .filter(dish -> !request.getDishIds().contains(dish.getId()))
              .toList();
      if (!deletableDishes.isEmpty()) {
        menu.removeDishes(deletableDishes);

        List<Long> deletableDishIds = deletableDishes.stream().map(Dish::getId).toList();
        this.menuDishService.deleteMenuDishes(deletableDishIds, request.getId());
      }

      List<Long> newDishIds =
          request.getDishIds().stream().filter(dishId -> !menu.containDishById(dishId)).toList();
      log.info("DishIds {}", newDishIds);
      List<Dish> newDishes = this.dishService.findByIds(newDishIds);

      for (Dish dish : newDishes) {
        menu.addDish(dish);
      }
    }
    this.menuService.save(menu);

    return BaseResponse.ok();
  }
}
