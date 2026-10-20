package com.james.LMS.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.james.LMS.entity.User;
import com.james.LMS.enums.TokenType;
import com.james.LMS.repository.UserRepository;
import com.james.LMS.service.CacheService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Opt-in integration test: use only a disposable local PostgreSQL/Redis environment. */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
      "spring.rabbitmq.listener.simple.auto-startup=false",
      "spring.rabbitmq.listener.direct.auto-startup=false"
    })
@EnabledIfEnvironmentVariable(named = "GOCOOK_AUTH_INTEGRATION", matches = "true")
class AuthIntegrationTest {
  @Autowired private TestRestTemplate http;
  @Autowired private ObjectMapper mapper;
  @Autowired private UserRepository users;
  @Autowired private CacheService cache;
  @Autowired private PasswordEncoder encoder;

  @Value("${spring.datasource.url}")
  private String databaseUrl;

  @Value("${jwt.secretKey}")
  private String secret;

  @Test
  void userCanRegisterLoginRefreshAndLogoutWithoutChefProfile() throws Exception {
    assertThat(databaseUrl).startsWith("jdbc:postgresql://localhost:");
    String email = "auth-test-" + UUID.randomUUID() + "@example.invalid";
    String password = UUID.randomUUID() + "Aa!9";
    Map<String, String> signup =
        Map.of(
            "username",
            "Authentication Test",
            "email",
            email,
            "phone",
            "0900000000",
            "password",
            password);
    try {
      assertThat(
              post(
                      "/api/v1/users/sign-up",
                      Map.of("username", "Missing phone", "email", email, "password", password),
                      null)
                  .getStatusCode())
          .isEqualTo(HttpStatus.BAD_REQUEST);
      assertThat(post("/api/v1/users/sign-up", signup, null).getStatusCode())
          .isEqualTo(HttpStatus.OK);
      User saved = users.findByEmail(email).orElseThrow();
      assertThat(saved.getPhone()).isEqualTo(signup.get("phone"));
      assertThat(encoder.matches(password, saved.getPassword())).isTrue();
      assertThat(post("/api/v1/users/sign-up", signup, null).getStatusCode())
          .isEqualTo(HttpStatus.BAD_REQUEST);
      assertThat(profile(null).getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
      assertThat(
              post(
                      "/api/v2/users/login",
                      Map.of("email", email, "password", UUID.randomUUID().toString()),
                      null)
                  .getStatusCode())
          .isEqualTo(HttpStatus.UNAUTHORIZED);
      assertThat(
              post(
                      "/api/v2/users/login",
                      Map.of("email", "missing-" + email, "password", password),
                      null)
                  .getStatusCode())
          .isEqualTo(HttpStatus.UNAUTHORIZED);
      ResponseEntity<String> login =
          post(
              "/api/v2/users/login",
              Map.of("email", email.toUpperCase(), "password", password),
              null);
      assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
      String access = cookie(login, "access-token");
      String refresh = cookie(login, "refresh-token");
      JsonNode profile = mapper.readTree(profile(access).getBody()).path("data");
      assertThat(profile.path("username").asText()).isEqualTo("Authentication Test");
      assertThat(profile.path("chefProfile").isNull()).isTrue();
      assertThat(profile.path("isChef").asBoolean()).isFalse();
      assertThat(profile.path("roles").toString()).contains("ROLE_USER");
      assertThat(profile(access).getStatusCode()).isEqualTo(HttpStatus.OK);
      assertThat(profile("access-token=" + expiredToken(email)).getStatusCode())
          .isEqualTo(HttpStatus.UNAUTHORIZED);
      assertThat(post("/api/v2/users/refresh-token", null, null).getStatusCode().is4xxClientError())
          .isTrue();
      assertThat(
              post("/api/v2/users/refresh-token", null, "refresh-token=invalid")
                  .getStatusCode()
                  .is4xxClientError())
          .isTrue();
      assertThat(
              post("/api/v2/users/refresh-token", null, "refresh-token=" + expiredToken(email))
                  .getStatusCode()
                  .is4xxClientError())
          .isTrue();
      // An expired access cookie must not block the public refresh endpoint.
      ResponseEntity<String> rotated =
          post(
              "/api/v2/users/refresh-token",
              null,
              refresh + "; access-token=" + expiredToken(email));
      assertThat(rotated.getStatusCode()).isEqualTo(HttpStatus.OK);
      String newAccess = cookie(rotated, "access-token");
      String newRefresh = cookie(rotated, "refresh-token");
      assertThat(newRefresh).isNotEqualTo(refresh);
      assertThat(
              post("/api/v2/users/refresh-token", null, refresh).getStatusCode().is4xxClientError())
          .isTrue();
      assertThat(profile(access).getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
      assertThat(profile(newAccess).getStatusCode()).isEqualTo(HttpStatus.OK);
      ResponseEntity<String> logout =
          post("/api/v2/users/logout", Map.of(), newAccess + "; " + newRefresh);
      assertThat(logout.getStatusCode()).isEqualTo(HttpStatus.OK);
      assertThat(logout.getHeaders().get(HttpHeaders.SET_COOKIE))
          .hasSize(4)
          .allMatch(value -> value.contains("Max-Age=0"));
      assertThat(profile(newAccess).getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
      assertThat(
              post("/api/v2/users/refresh-token", null, newRefresh)
                  .getStatusCode()
                  .is4xxClientError())
          .isTrue();
    } finally {
      cache.delete(String.format(TokenType.ACCESS_TOKEN.getCacheKeyTemplate(), email));
      cache.delete(String.format(TokenType.REFRESH_TOKEN.getCacheKeyTemplate(), email));
      users.findByEmail(email).ifPresent(user -> users.deleteById(user.getId()));
    }
  }

  private ResponseEntity<String> post(String path, Object body, String cookies) {
    return http.exchange(
        path, HttpMethod.POST, new HttpEntity<>(body, headers(cookies)), String.class);
  }

  private ResponseEntity<String> profile(String cookies) {
    return http.exchange(
        "/api/v1/users/profile", HttpMethod.GET, new HttpEntity<>(headers(cookies)), String.class);
  }

  private HttpHeaders headers(String cookies) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    if (cookies != null) headers.set(HttpHeaders.COOKIE, cookies);
    return headers;
  }

  private String cookie(ResponseEntity<String> response, String name) {
    List<String> cookies = response.getHeaders().get(HttpHeaders.SET_COOKIE);
    assertThat(cookies).isNotNull();
    return cookies.stream()
        .filter(value -> value.startsWith(name + "="))
        .findFirst()
        .orElseThrow()
        .split(";", 2)[0];
  }

  private String expiredToken(String email) {
    return Jwts.builder()
        .setSubject(email)
        .setExpiration(new Date(System.currentTimeMillis() - 10000))
        .signWith(SignatureAlgorithm.HS512, secret)
        .compact();
  }
}
