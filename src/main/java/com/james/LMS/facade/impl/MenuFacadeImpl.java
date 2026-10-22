package com.james.LMS.facade.impl;

import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.dto.CategorySelectionContext;
import com.james.LMS.entity.*;
import com.james.LMS.enums.ErrorCode;
import com.james.LMS.enums.FileType;
import com.james.LMS.exception.EntityNotFoundException;
import com.james.LMS.exception.UploadFileException;
import com.james.LMS.facade.MenuFacade;
import com.james.LMS.request.UpsetMenuAssetRequest;
import com.james.LMS.request.UpsetMenuRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.service.*;

import java.io.IOException;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    CategorySelectionContext findingOrCreatingCategory =
        CategorySelectionContext.builder()
            .isCreateNewCategory(request.getIsCreateNewCategory())
            .categoryId(request.getCategoryId())
            .newCategoryName(request.getNewCategory())
            .menu(menu)
            .build();

    this.findOrCreateCategory(findingOrCreatingCategory);

    List<Dish> dishes = this.dishService.findByIds(request.getDishIds(), principal.getId());

    dishes.forEach(menu::addDish);

    this.menuService.save(menu);

    return BaseResponse.ok();
  }

  @Override
  @Transactional
  public BaseResponse<Void> addMenuAssets(UpsetMenuAssetRequest request) {
    SecurityUserDetails principal = SecurityUserDetails.getPrincipal();

    Menu menu = menuService.findByIdAndChefId(request.getMenuId(), principal.getId())
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.MENU_NOT_FOUND));

    byte [] imageBytes;
    try {
      imageBytes = request.getFile().getBytes();
    } catch (IOException ioException){
      throw new UploadFileException(ErrorCode.FILE_ERROR_UPLOAD);
    }
    String url = cloudinaryService.uploadFile(imageBytes, FileType.IMAGE);

    menuAssetService.save(MenuAsset.builder().url(url).menu(menu).build());
    return BaseResponse.ok();
  }


  private void findOrCreateCategory(CategorySelectionContext findingOrCreatingCategory) {
    Category category =
        findingOrCreatingCategory.isCreateNewCategory()
            ? this.categoryService
                .findById(findingOrCreatingCategory.categoryId())
                .orElse(
                    Category.builder().name(findingOrCreatingCategory.newCategoryName()).build())
            : Category.builder().name(findingOrCreatingCategory.newCategoryName()).build();

    findingOrCreatingCategory.menu().addCategory(category);
  }
}
