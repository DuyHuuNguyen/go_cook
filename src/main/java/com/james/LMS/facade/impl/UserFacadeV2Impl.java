package com.james.LMS.facade.impl;

import com.james.LMS.config.SecurityConfig;
import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.enums.ErrorCode;
import com.james.LMS.enums.TokenType;
import com.james.LMS.exception.InvalidTokenException;
import com.james.LMS.facade.UserFacadeV2;
import com.james.LMS.request.BecomeChefRequest;
import com.james.LMS.request.LoginRequest;
import com.james.LMS.request.RefreshTokenRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.service.*;
import jakarta.servlet.http.HttpServletResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserFacadeV2Impl implements UserFacadeV2 {

  private static final int COOKIE_ACCESS_TOKEN_TTL = 60 * 60;
  private static final int COOKIE_REFRESH_TOKEN_TTL = 60 * 60 * 24 * 14;
  private static final int COOKIE_REMEMBER_ME_TTL = 60 * 60 * 24 * 30;
  private static final String REMEMBER_ME_KEY = "remember_me";

  private final JwtService jwtService;
  private final CacheService cacheService;
  private final AuthenticationManager authenticationManager;
  private final ChefApplicationService chefApplicationService;
  private final UserService userService;

  @Value("${security.cookie.secure:false}")
  private boolean cookieSecure;

  @Value("${security.cookie.same-site:Lax}")
  private String cookieSameSite;

  @Override
  public BaseResponse<Void> login(LoginRequest loginRequest, HttpServletResponse response) {
    String email = loginRequest.getEmail().trim().toLowerCase(Locale.ROOT);

    Authentication authentication = authenticate(email, loginRequest.getPassword());
    SecurityContextHolder.getContext().setAuthentication(authentication);

    String accessToken = jwtService.generateAccessToken(email);
    String refreshToken = jwtService.generateRefreshToken(email);

    cacheService.store(cacheKey(TokenType.ACCESS_TOKEN, email), accessToken, 1, TimeUnit.HOURS);
    cacheService.store(cacheKey(TokenType.REFRESH_TOKEN, email), refreshToken, 14, TimeUnit.DAYS);

    ResponseCookie accessTokenCookie = buildAccessTokenCookie(accessToken, COOKIE_ACCESS_TOKEN_TTL);
    ResponseCookie refreshTokenCookie =
        buildRefreshTokenCookie(refreshToken, COOKIE_REFRESH_TOKEN_TTL);
    ResponseCookie validateLoginCookie = buildValidateLoginCookie();
    ResponseCookie rememberMeCookie = buildRememberMeCookie();

    addCookies(
        response, accessTokenCookie, refreshTokenCookie, validateLoginCookie, rememberMeCookie);

    return BaseResponse.ok();
  }

  @Override
  public BaseResponse<Void> refreshToken(
      RefreshTokenRequest refreshTokenRequest, HttpServletResponse response) {
    String email = jwtService.getEmailFromJwtToken(refreshTokenRequest.getRefreshToken());
    if (userService.findByEmail(email).filter(user -> user.isActive()).isEmpty()) {
      throw new InvalidTokenException(ErrorCode.JWT_INVALID);
    }

    String refreshTokenKey = cacheKey(TokenType.REFRESH_TOKEN, email);
    if (!refreshTokenRequest.getRefreshToken().equals(cacheService.retrieve(refreshTokenKey))) {
      throw new InvalidTokenException(ErrorCode.JWT_INVALID);
    }

    String accessToken = jwtService.generateAccessToken(email);
    String refreshToken = jwtService.generateRefreshToken(email);
    cacheService.store(cacheKey(TokenType.ACCESS_TOKEN, email), accessToken, 1, TimeUnit.HOURS);
    cacheService.store(refreshTokenKey, refreshToken, 14, TimeUnit.DAYS);

    addCookies(
        response,
        buildAccessTokenCookie(accessToken, COOKIE_ACCESS_TOKEN_TTL),
        buildRefreshTokenCookie(refreshToken, COOKIE_REFRESH_TOKEN_TTL));

    return BaseResponse.ok();
  }

  @Override
  public BaseResponse<Void> logout(HttpServletResponse response) {
    SecurityUserDetails principal = getCurrentPrincipal();

    cacheService.delete(cacheKey(TokenType.REFRESH_TOKEN, principal.getUsername()));
    cacheService.delete(cacheKey(TokenType.ACCESS_TOKEN, principal.getUsername()));

    addCookies(
        response,
        buildAccessTokenCookie(SecurityConfig.CLEAR_COOKIE_VALUE, 0),
        buildRefreshTokenCookie(SecurityConfig.CLEAR_COOKIE_VALUE, 0),
        buildCookie(SecurityConfig.VALIDATE_LOGIN, "", false, cookieSecure, 0),
        buildCookie(REMEMBER_ME_KEY, "", false, cookieSecure, 0));
    SecurityContextHolder.clearContext();

    return BaseResponse.ok();
  }

  @Override
  @Transactional
  public BaseResponse<Void> becomeChef(BecomeChefRequest request) {
    chefApplicationService.submit(getCurrentPrincipal().getId(), request);
    return BaseResponse.ok();
  }

  private Authentication authenticate(String email, String password) {
    try {
      return authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(email, password));
    } catch (DisabledException exception) {
      throw new BadCredentialsException("Email or password is incorrect");
    }
  }

  private SecurityUserDetails getCurrentPrincipal() {
    return (SecurityUserDetails)
        SecurityContextHolder.getContext().getAuthentication().getPrincipal();
  }

  private String cacheKey(TokenType tokenType, String email) {
    return String.format(tokenType.getCacheKeyTemplate(), email);
  }

  private ResponseCookie buildAccessTokenCookie(String value, int maxAge) {
    return buildCookie(SecurityConfig.COOKIE_SECURITY_NAME, value, true, cookieSecure, maxAge);
  }

  private ResponseCookie buildRefreshTokenCookie(String value, int maxAge) {
    return buildCookie(SecurityConfig.COOKIE_REFRESH_TOKEN_NAME, value, true, cookieSecure, maxAge);
  }

  private ResponseCookie buildValidateLoginCookie() {
    return buildCookie(
        SecurityConfig.VALIDATE_LOGIN, "true", false, cookieSecure, COOKIE_REFRESH_TOKEN_TTL);
  }

  private ResponseCookie buildRememberMeCookie() {
    String rememberInfo =
        URLEncoder.encode(getCurrentPrincipal().getRememberInfo(), StandardCharsets.UTF_8);

    return buildCookie(REMEMBER_ME_KEY, rememberInfo, false, cookieSecure, COOKIE_REMEMBER_ME_TTL);
  }

  private ResponseCookie buildCookie(
      String name, String value, boolean httpOnly, boolean secure, int maxAgeSeconds) {
    return ResponseCookie.from(name, value)
        .httpOnly(httpOnly)
        .secure(secure)
        .sameSite(cookieSameSite)
        .path("/")
        .maxAge(maxAgeSeconds)
        .build();
  }

  private void addCookies(HttpServletResponse response, ResponseCookie... cookies) {
    for (ResponseCookie cookie : cookies) {
      response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
  }
}
