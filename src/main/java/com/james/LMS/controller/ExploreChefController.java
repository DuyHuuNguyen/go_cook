package com.james.LMS.controller;

import com.james.LMS.config.SecurityConfig;
import com.james.LMS.facade.ExploreChefFacade;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ExploreChefDetailResponse;
import com.james.LMS.response.ExploreChefResponse;
import com.james.LMS.response.KeySetPaginationResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/explore-chefs")
@RequiredArgsConstructor
public class ExploreChefController {
  private final ExploreChefFacade exploreChefFacade;

  @GetMapping("/{lastId}")
  @ResponseStatus(HttpStatus.OK)
  @Operation(
      tags = {"Explore Chef APIs"},
      summary = "Pagination with id > last id and limit = 20")
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("isAuthenticated()")
  public BaseResponse<KeySetPaginationResponse<ExploreChefResponse>> findExploreChefByLastId(
      @PathVariable("lastId") Long lastId) {
    return this.exploreChefFacade.findExploreChefByLastId(lastId);
  }

  @GetMapping("/detail/{chefId}")
  @ResponseStatus(HttpStatus.OK)
  @Operation(
      tags = {"Explore Chef APIs"},
      summary = "Get approved chef detail with skills, dishes, service areas and public menus")
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("isAuthenticated()")
  public BaseResponse<ExploreChefDetailResponse> findExploreChefDetailByChefId(
      @PathVariable("chefId") Long chefId) {
    return this.exploreChefFacade.findExploreChefDetailByChefId(chefId);
  }
}
