package com.james.LMS.controller;

import com.james.LMS.config.SecurityConfig;
import com.james.LMS.facade.MenuFacade;
import com.james.LMS.request.MenuOfChefRequest;
import com.james.LMS.request.MenuSearchRequest;
import com.james.LMS.request.UpsetMenuAssetRequest;
import com.james.LMS.request.UpsetMenuRequest;
import com.james.LMS.response.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/menus")
@RequiredArgsConstructor
public class MenuController {

  private final MenuFacade menuFacade;

  @GetMapping
  @Operation(
      summary = "List visible menus with their dishes and images",
      description =
          "Search by menu or dish, filter by category, price and diners, then sort by latest, price or name. Page is one-based.",
      tags = {"Menu APIs"})
  public BaseResponse<PaginationResponse<MenuResponse>> findMenus(
      @Valid @ParameterObject MenuSearchRequest request) {
    return menuFacade.findMenus(request);
  }

  @GetMapping("/chef/menus")
  @ResponseStatus(HttpStatus.OK)
  @Operation(tags = {"Menu APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasRole('ROLE_CHEF')")
  public BaseResponse<PaginationResponse<MenuResponse>> findAllMenuOfChef(
      @Valid MenuOfChefRequest request) {
    return menuFacade.findAllMenuOfChef(request);
  }

  @GetMapping("/chef/menus/{lastId}")
  @ResponseStatus(HttpStatus.OK)
  @Operation(tags = {"Menu APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasRole('ROLE_CHEF')")
  public BaseResponse<KeySetPaginationResponse<MenuResponse>> findAllMenuOfChef(
      @PathVariable("lastId") Long lastId) {
    return menuFacade.findByLastId(lastId);
  }

  @PostMapping("/creation")
  @ResponseStatus(HttpStatus.OK)
  @Operation(tags = {"Menu APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasRole('ROLE_CHEF')")
  public BaseResponse<Void> createMenu(@Valid @RequestBody UpsetMenuRequest request) {
    return this.menuFacade.createMenu(request);
  }

  @PostMapping(value = "/asset/{menuId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.OK)
  @Operation(tags = {"Menu APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasRole('ROLE_CHEF')")
  public BaseResponse<Void> addMenuAsset(
      @PathVariable Long menuId, @RequestPart("file") MultipartFile file) {
    UpsetMenuAssetRequest request =
        UpsetMenuAssetRequest.builder().menuId(menuId).file(file).build();
    return this.menuFacade.addMenuAssets(request);
  }

  @GetMapping("/{menuId}/assets/{lastAssetId}")
  @ResponseStatus(HttpStatus.OK)
  @Operation(tags = {"Menu APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasRole('ROLE_CHEF')")
  public BaseResponse<KeySetPaginationResponse<MenuAssetResponse>> findAllMenuAssets(
      @PathVariable("menuId") Long menuId, @PathVariable("lastAssetId") Long lastAssetId) {
    return this.menuFacade.findAllAssets(menuId, lastAssetId);
  }

  @PatchMapping("/{menuId}/asset/{assetId}")
  @ResponseStatus(HttpStatus.OK)
  @Operation(
      tags = {"Menu APIs"},
      summary = "Soft delete asset")
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasRole('ROLE_CHEF')")
  public BaseResponse<Void> removeMenuAsset(
      @PathVariable("menuId") Long menuId, @PathVariable("assetId") Long assetId) {
    return this.menuFacade.removeMenuAsset(menuId, assetId);
  }

  @PatchMapping("/edit/{id}")
  @ResponseStatus(HttpStatus.OK)
  @Operation(tags = {"Menu APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasRole('ROLE_CHEF')")
  public BaseResponse<Void> editMenu(
      @PathVariable("id") Long id, @Valid @RequestBody UpsetMenuRequest request) {
    request.withId(id);
    return this.menuFacade.editMenu(request);
  }
}
