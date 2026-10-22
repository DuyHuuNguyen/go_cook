package com.james.LMS.controller;

import com.james.LMS.config.SecurityConfig;
import com.james.LMS.facade.LocationFacade;
import com.james.LMS.request.WardCriteria;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ProvinceResponse;
import com.james.LMS.response.WardResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/locations")
@RequiredArgsConstructor
public class LocationController {

  private final LocationFacade locationFacade;

  @GetMapping("/provinces")
  @ResponseStatus(HttpStatus.OK)
  @Operation(tags = {"Location APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("isAuthenticated()")
  public BaseResponse<List<ProvinceResponse>> findAllProvinces() {
    return this.locationFacade.findAllProvinces();
  }

  @GetMapping("/wards")
  @ResponseStatus(HttpStatus.OK)
  @Operation(tags = {"Location APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("isAuthenticated()")
  public BaseResponse<List<WardResponse>> findByWardName(@Valid WardCriteria criteria) {
    return this.locationFacade.findByWardName(criteria);
  }
}
