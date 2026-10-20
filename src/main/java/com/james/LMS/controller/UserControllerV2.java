package com.james.LMS.controller;

import com.james.LMS.config.SecurityConfig;
import com.james.LMS.facade.UserFacadeV2;
import com.james.LMS.request.LoginRequest;
import com.james.LMS.request.RefreshTokenRequest;
import com.james.LMS.response.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v2/users")
@RequiredArgsConstructor
public class UserControllerV2 {

  private final UserFacadeV2 userFacade;

  @PostMapping("/login")
  @ResponseStatus(HttpStatus.OK)
  @Operation(
      summary = "Login to system by email and password",
      tags = {"User v2 APIs update to test deploy production"})
  public BaseResponse<Void> login(
      @Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response) {
    return this.userFacade.login(loginRequest, response);
  }

  @PostMapping("/refresh-token")
  @ResponseStatus(HttpStatus.OK)
  @Operation(tags = {"User v2 APIs update to test deploy production"})
  public BaseResponse<Void> refreshToken(
      @CookieValue(name = SecurityConfig.COOKIE_REFRESH_TOKEN_NAME, required = false)
          String refreshToken,
      HttpServletResponse response) {
    return this.userFacade.refreshToken(new RefreshTokenRequest(refreshToken), response);
  }

  @PostMapping("/logout")
  @ResponseStatus(HttpStatus.OK)
  @Operation(tags = {"User v2 APIs update to test deploy production"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("isAuthenticated()")
  public BaseResponse<Void> logout(HttpServletResponse response) {
    return this.userFacade.logout(response);
  }
}
