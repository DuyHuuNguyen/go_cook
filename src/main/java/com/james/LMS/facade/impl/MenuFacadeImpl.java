package com.james.LMS.facade.impl;

import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.entity.*;
import com.james.LMS.enums.ErrorCode;
import com.james.LMS.enums.FileType;
import com.james.LMS.exception.EntityNotFoundException;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuFacadeImpl implements MenuFacade {
  private final MenuService menuService;
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
    List<Dish> dishes = this.dishService.findByIds(request.getDishIds(), principal.getId());

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
  public BaseResponse<PaginationResponse<MenuResponse>> findAllMenuOfChef(MenuOfChefRequest request) {
    var principle = SecurityUserDetails.getPrincipal();
    Pageable pageable = PageRequest.of(request.getCurrentPage() -1, request.getPageSize());
    return BaseResponse.build(PaginationResponse.from(menuService.findAllMenuByChefId(principle.getId(),pageable )), true);
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
}
