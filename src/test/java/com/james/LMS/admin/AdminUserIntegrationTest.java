package com.james.LMS.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.james.LMS.entity.User;
import com.james.LMS.enums.RoleEnum;
import com.james.LMS.enums.TokenType;
import com.james.LMS.repository.RoleRepository;
import com.james.LMS.repository.UserRepository;
import com.james.LMS.service.CacheService;
import jakarta.servlet.http.Cookie;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(
    properties = {
      "spring.rabbitmq.listener.simple.auto-startup=false",
      "spring.rabbitmq.listener.direct.auto-startup=false"
    })
@AutoConfigureMockMvc
@Transactional
@EnabledIfEnvironmentVariable(named = "GOCOOK_ADMIN_USER_INTEGRATION", matches = "true")
class AdminUserIntegrationTest {
  @Autowired MockMvc mvc;
  @Autowired UserRepository users;
  @Autowired RoleRepository roles;
  @Autowired PasswordEncoder encoder;
  @Autowired CacheService cache;
  @Autowired ObjectMapper mapper;

  @Test
  void adminManagesUsersAndLockRevokesAccess() throws Exception {
    String password = "AdminUserTest-" + UUID.randomUUID();
    User user = create(RoleEnum.ROLE_USER, password);
    User admin = create(RoleEnum.ROLE_SYSTEM_ADMIN, password);
    try {
      MvcResult userLogin = login(user, password);
      Cookie userAccess = cookie(userLogin, "access-token");
      Cookie userRefresh = cookie(userLogin, "refresh-token");
      Cookie adminAccess = cookie(login(admin, password), "access-token");
      mvc.perform(get("/api/v1/admin/users").cookie(userAccess)).andExpect(status().isForbidden());
      mvc.perform(
              patch("/api/v1/admin/users/{id}/status", user.getId())
                  .cookie(userAccess)
                  .contentType("application/json")
                  .content("{\"status\":\"LOCKED\",\"reason\":\"test\"}"))
          .andExpect(status().isForbidden());
      mvc.perform(
              get("/api/v1/admin/users")
                  .cookie(adminAccess)
                  .param("keyword", user.getEmail())
                  .param("status", "ACTIVE")
                  .param("page", "1")
                  .param("size", "10"))
          .andExpect(status().isOk())
          .andExpect(
              result ->
                  assertThat(
                          mapper
                              .readTree(result.getResponse().getContentAsString())
                              .path("data")
                              .path("totalElements")
                              .asLong())
                      .isEqualTo(1));
      mvc.perform(
              patch("/api/v1/admin/users/{id}/status", admin.getId())
                  .cookie(adminAccess)
                  .contentType("application/json")
                  .content("{\"status\":\"LOCKED\",\"reason\":\"test\"}"))
          .andExpect(status().isNotFound());
      mvc.perform(
              patch("/api/v1/admin/users/{id}/status", user.getId())
                  .cookie(adminAccess)
                  .contentType("application/json")
                  .content("{\"status\":\"LOCKED\",\"reason\":\" \"}"))
          .andExpect(status().isBadRequest());
      mvc.perform(
              patch("/api/v1/admin/users/{id}/status", user.getId())
                  .cookie(adminAccess)
                  .contentType("application/json")
                  .content("{\"status\":\"LOCKED\",\"reason\":\" Vi phạm thử nghiệm \"}"))
          .andExpect(status().isOk());
      assertThat(users.findById(user.getId()).orElseThrow().isActive()).isFalse();
      assertThat(users.findById(user.getId()).orElseThrow().getLockReason())
          .isEqualTo("Vi phạm thử nghiệm");
      assertThat(roles.findAllByUserId(user.getId()))
          .extracting(role -> role.getRoleName())
          .containsExactly(RoleEnum.ROLE_USER);
      mvc.perform(get("/api/v1/users/profile").cookie(userAccess))
          .andExpect(status().isUnauthorized());
      mvc.perform(
              post("/api/v2/users/login")
                  .contentType("application/json")
                  .content(
                      mapper.writeValueAsString(
                          Map.of("email", user.getEmail(), "password", password))))
          .andExpect(status().isUnauthorized());
      mvc.perform(post("/api/v2/users/refresh-token").cookie(userRefresh))
          .andExpect(status().isBadRequest());
      mvc.perform(
              post("/api/v1/users/refresh-token")
                  .contentType("application/json")
                  .content(
                      mapper.writeValueAsString(Map.of("refreshToken", userRefresh.getValue()))))
          .andExpect(status().isBadRequest());
      mvc.perform(
              get("/api/v1/admin/users")
                  .cookie(adminAccess)
                  .param("keyword", user.getEmail())
                  .param("status", "LOCKED"))
          .andExpect(status().isOk())
          .andExpect(
              result ->
                  assertThat(
                          mapper
                              .readTree(result.getResponse().getContentAsString())
                              .path("data")
                              .path("totalElements")
                              .asLong())
                      .isEqualTo(1));
      mvc.perform(
              patch("/api/v1/admin/users/{id}/status", user.getId())
                  .cookie(adminAccess)
                  .contentType("application/json")
                  .content("{\"status\":\"ACTIVE\"}"))
          .andExpect(status().isOk());
      assertThat(users.findById(user.getId()).orElseThrow().getLockReason())
          .isEqualTo("Vi phạm thử nghiệm");
      Cookie newAccess = cookie(login(user, password), "access-token");
      mvc.perform(get("/api/v1/users/profile").cookie(newAccess)).andExpect(status().isOk());
    } finally {
      for (String email : List.of(user.getEmail(), admin.getEmail())) {
        cache.delete(String.format(TokenType.ACCESS_TOKEN.getCacheKeyTemplate(), email));
        cache.delete(String.format(TokenType.REFRESH_TOKEN.getCacheKeyTemplate(), email));
      }
    }
  }

  private User create(RoleEnum role, String password) {
    return users.saveAndFlush(
        User.builder()
            .username("Admin user test")
            .email("admin-user-test-" + UUID.randomUUID() + "@example.invalid")
            .phone("0900000000")
            .password(encoder.encode(password))
            .roles(new ArrayList<>(List.of(roles.findRoleByRoleName(role).orElseThrow())))
            .build());
  }

  private MvcResult login(User user, String password) throws Exception {
    return mvc.perform(
            post("/api/v2/users/login")
                .contentType("application/json")
                .content(
                    mapper.writeValueAsString(
                        Map.of("email", user.getEmail(), "password", password))))
        .andExpect(status().isOk())
        .andReturn();
  }

  private Cookie cookie(MvcResult result, String name) {
    String header =
        result.getResponse().getHeaders("Set-Cookie").stream()
            .filter(value -> value.startsWith(name + "="))
            .findFirst()
            .orElseThrow();
    return new Cookie(name, header.substring(name.length() + 1).split(";", 2)[0]);
  }
}
