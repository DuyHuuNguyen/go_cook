package com.james.LMS.controller;

import com.james.LMS.config.SecurityConfig;
import com.james.LMS.facade.MenuFacade;
import com.james.LMS.request.UpsetMenuAssetRequest;
import com.james.LMS.request.UpsetMenuRequest;
import com.james.LMS.response.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

  @PostMapping
  @ResponseStatus(HttpStatus.OK)
  @Operation(tags = {"Menu APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasRole('ROLE_CHEF')")
  BaseResponse<Void> createMenu(@Valid @RequestBody UpsetMenuRequest request) {
    return this.menuFacade.createMenu(request);
  }

  @PostMapping(
          value = "/asset/{menuId}",
          consumes = MediaType.MULTIPART_FORM_DATA_VALUE
  )
  @ResponseStatus(HttpStatus.OK)
  @Operation(tags = {"Menu APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasRole('ROLE_CHEF')")
  public BaseResponse<Void> addMenuAsset(
          @PathVariable Long menuId,
          @RequestPart("file") MultipartFile file) {
    UpsetMenuAssetRequest request = UpsetMenuAssetRequest.builder().menuId(menuId).file(file).build();
    return this.menuFacade.addMenuAssets(request);
  }
}
