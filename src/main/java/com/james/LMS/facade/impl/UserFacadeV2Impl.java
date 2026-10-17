package com.james.LMS.facade.impl;

import com.james.LMS.config.SecurityConfig;
import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.entity.Role;
import com.james.LMS.enums.ErrorCode;
import com.james.LMS.enums.TokenType;
import com.james.LMS.facade.UserFacadeV2;
import com.james.LMS.request.LoginRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.service.CacheService;
import com.james.LMS.service.JwtService;
import com.james.LMS.service.RoleService;
import com.james.LMS.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserFacadeV2Impl implements UserFacadeV2 {
  private final JwtService jwtService;
  private final CacheService cacheService;
  private final AuthenticationManager authenticationManager;

  private static final int COOKIE_ACCESS_TOKEN_TTL = 60 * 60;
  private static final int COOKIE_REFRESH_TOKEN_TTL = 60 * 60 * 24 * 14;
  private static final int COOKIE_REMEMBER_ME_TTL = 60 * 60 * 24 * 30;
  private static final String REMEMBER_ME_KEY = "remember_me";

  @Value("${security.cookie.secure:false}")
  private boolean cookieSecure;

  @Value("${security.cookie.same-site:Lax}")
  private String cookieSameSite;

  @Override
  public BaseResponse<Void> login(LoginRequest loginRequest, HttpServletResponse response) {
    String email = loginRequest.getEmail();
    String password = loginRequest.getPassword();
    var authentication =
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            email, password));
    SecurityContextHolder.getContext().setAuthentication(authentication);

    String accessToken = jwtService.generateAccessToken(email);
    String refreshToken = jwtService.generateRefreshToken(email);

    String refreshTokenCacheKey =
        String.format(TokenType.REFRESH_TOKEN.getCacheKeyTemplate(), email);
    String accessTokenCacheKey =
        String.format(TokenType.ACCESS_TOKEN.getCacheKeyTemplate(), email);

    cacheService.store(accessTokenCacheKey, accessToken, 1, TimeUnit.HOURS);
    cacheService.store(refreshTokenCacheKey, refreshToken, 14, TimeUnit.DAYS);

    ResponseCookie accessTokenCookie =
        ResponseCookie.from(SecurityConfig.COOKIE_SECURITY_NAME, accessToken)
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite(cookieSameSite)
            .path("/")
            .maxAge(COOKIE_ACCESS_TOKEN_TTL)
            .build();

    ResponseCookie refreshTokenCookie =
        ResponseCookie.from(SecurityConfig.COOKIE_REFRESH_TOKEN_NAME, refreshToken)
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite(cookieSameSite)
            .path("/")
            .maxAge(COOKIE_REFRESH_TOKEN_TTL)
            .build();

    var principal =
            (SecurityUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

    String rememberInfo = URLEncoder.encode(
            principal.getRememberInfo(),
            StandardCharsets.UTF_8
    );

    log.info(rememberInfo);

    ResponseCookie rememberMeCookie =
            ResponseCookie.from(REMEMBER_ME_KEY, rememberInfo)
                    .httpOnly(false)
                    .secure(true)
                    .sameSite(cookieSameSite)
                    .path("/")
                    .maxAge(COOKIE_REMEMBER_ME_TTL)
                    .build();

    ResponseCookie validateLoginCookie =
        ResponseCookie.from(SecurityConfig.VALIDATE_LOGIN, "true")
            .httpOnly(false)
            .secure(cookieSecure)
            .sameSite(cookieSameSite)
            .path("/")
            .maxAge(COOKIE_REFRESH_TOKEN_TTL)
            .build();

    response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());
    response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());
    response.addHeader(HttpHeaders.SET_COOKIE, validateLoginCookie.toString());
    response.addHeader(HttpHeaders.SET_COOKIE, rememberMeCookie.toString());

    return BaseResponse.ok();
  }
}
