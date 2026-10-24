package com.james.LMS.chef;

import static org.assertj.core.api.Assertions.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.controller.ChefApplicationController;
import com.james.LMS.controller.UserControllerV2;
import com.james.LMS.entity.User;
import com.james.LMS.enums.ChefApplicationStatus;
import com.james.LMS.enums.RoleEnum;
import com.james.LMS.facade.DishFacade;
import com.james.LMS.facade.MenuFacade;
import com.james.LMS.repository.ChefProfileRepository;
import com.james.LMS.repository.RoleRepository;
import com.james.LMS.repository.UserRepository;
import com.james.LMS.request.BecomeChefRequest;
import com.james.LMS.request.ChefReviewRequest;
import com.james.LMS.service.ChefApplicationService;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import javax.sql.DataSource;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

/** Local PostgreSQL only; application fixtures are rolled back after every test. */
@SpringBootTest(
    properties = {
      "spring.rabbitmq.listener.simple.auto-startup=false",
      "spring.rabbitmq.listener.direct.auto-startup=false"
    })
@EnabledIfEnvironmentVariable(named = "GOCOOK_CHEF_INTEGRATION", matches = "true")
@Transactional
class ChefApplicationIntegrationTest {
  @Autowired UserRepository users;
  @Autowired RoleRepository roles;
  @Autowired ChefProfileRepository profiles;
  @Autowired ChefApplicationService service;
  @Autowired UserControllerV2 userController;
  @Autowired ChefApplicationController controller;
  @Autowired DishFacade dishes;
  @Autowired MenuFacade menus;
  @Autowired JdbcTemplate jdbc;
  @Autowired ObjectMapper mapper;
  @Autowired DataSource dataSource;

  @AfterEach
  void clearSecurity() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void applicationLifecycleAndBackendPermissions() throws Exception {
    try (var connection = dataSource.getConnection()) {
      assertThat(connection.getMetaData().getURL()).startsWith("jdbc:postgresql://localhost:");
    }
    User user = createUser(RoleEnum.ROLE_USER);
    User admin = createUser(RoleEnum.ROLE_SYSTEM_ADMIN);
    var location =
        jdbc.queryForMap("SELECT w.code ward, w.province_code province FROM wards w LIMIT 1");
    var request =
        mapper.convertValue(
            Map.of(
                "phone",
                "0912345678",
                "bio",
                "Hồ sơ kiểm thử đầu bếp",
                "experienceYears",
                3,
                "provinceCode",
                location.get("province"),
                "wardCode",
                location.get("ward")),
            BecomeChefRequest.class);
    authenticate(user, RoleEnum.ROLE_USER);
    assertThatThrownBy(() -> controller.list(null, 1, 20))
        .isInstanceOf(AccessDeniedException.class);
    assertThatThrownBy(() -> controller.detail(1L)).isInstanceOf(AccessDeniedException.class);
    assertThatThrownBy(() -> controller.review(1L, review("APPROVED", null)))
        .isInstanceOf(AccessDeniedException.class);
    userController.becomeChef(request);
    var application = service.ownApplication(user.getId());
    Long id = application.getId();
    assertThat(application.getStatus()).isEqualTo(ChefApplicationStatus.PENDING);
    assertThat(application.getPhone()).isEqualTo("0912345678");
    assertThat(chefGrants(user)).isZero();
    assertThatThrownBy(() -> userController.becomeChef(request))
        .isInstanceOf(IllegalArgumentException.class);
    authenticate(admin, RoleEnum.ROLE_SYSTEM_ADMIN);
    assertThat(controller.list(ChefApplicationStatus.PENDING, 1, 100)).isNotNull();
    assertThatThrownBy(() -> controller.review(id, review("REJECTED", " ")))
        .isInstanceOf(IllegalArgumentException.class);
    controller.review(id, review("REJECTED", " Cần bổ sung giới thiệu "));
    assertThat(service.detail(id).getReason()).isEqualTo("Cần bổ sung giới thiệu");
    assertThat(service.detail(id).getStatusChangedBy()).isEqualTo(admin.getId());
    assertThat(chefGrants(user)).isZero();
    assertThatThrownBy(() -> controller.review(id, review("APPROVED", null)))
        .isInstanceOf(IllegalArgumentException.class);
    authenticate(user, RoleEnum.ROLE_USER);
    userController.becomeChef(request);
    assertThat(service.ownApplication(user.getId()).getStatus())
        .isEqualTo(ChefApplicationStatus.PENDING);
    assertThat(service.ownApplication(user.getId()).getReason()).isNull();
    assertThat(profiles.findByUserId(user.getId()).orElseThrow().getId()).isEqualTo(id);
    authenticate(admin, RoleEnum.ROLE_SYSTEM_ADMIN);
    controller.review(id, review("APPROVED", null));
    assertThat(service.detail(id).getStatus()).isEqualTo(ChefApplicationStatus.APPROVED);
    assertThat(chefGrants(user)).isEqualTo(1);
    service.requireApprovedSeller(user.getId());
    assertThatThrownBy(() -> controller.review(id, review("APPROVED", null)))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> controller.review(id, review("SUSPENDED", " ")))
        .isInstanceOf(IllegalArgumentException.class);
    controller.review(id, review("SUSPENDED", "Vi phạm quy định"));
    assertThat(service.detail(id).getStatus()).isEqualTo(ChefApplicationStatus.SUSPENDED);
    authenticate(user, RoleEnum.ROLE_USER, RoleEnum.ROLE_CHEF);
    assertThatThrownBy(() -> dishes.createDish(null)).isInstanceOf(AccessDeniedException.class);
    assertThatThrownBy(() -> menus.createMenu(null)).isInstanceOf(AccessDeniedException.class);
    assertThatThrownBy(() -> menus.addMenuAssets(null)).isInstanceOf(AccessDeniedException.class);
    assertThat(service.ownApplication(user.getId()).getStatus())
        .isEqualTo(ChefApplicationStatus.SUSPENDED);
    assertThatThrownBy(() -> userController.becomeChef(request))
        .isInstanceOf(IllegalArgumentException.class);
    authenticate(admin, RoleEnum.ROLE_SYSTEM_ADMIN);
    controller.review(id, review("APPROVED", "Đã khắc phục"));
    assertThat(service.detail(id).getStatus()).isEqualTo(ChefApplicationStatus.APPROVED);
    assertThat(chefGrants(user)).isEqualTo(1);
    service.requireApprovedSeller(user.getId());
  }

  @Test
  void migrationPreservesLegacyGrantsWithoutInventingAuditHistory() throws Exception {
    // Shadow production tables with connection-local temporary fixtures, then roll back everything.
    try (var connection = dataSource.getConnection();
        var statement = connection.createStatement()) {
      assertThat(connection.getMetaData().getURL()).startsWith("jdbc:postgresql://localhost:");
      connection.setAutoCommit(false);
      try {
        statement.execute("CREATE TEMP TABLE users (id BIGINT PRIMARY KEY) ON COMMIT DROP");
        statement.execute(
            "CREATE TEMP TABLE roles (id BIGINT, role_name VARCHAR, is_active BOOLEAN) ON COMMIT DROP");
        statement.execute(
            "CREATE TEMP TABLE user_roles (user_id BIGINT, role_id BIGINT, is_active BOOLEAN) ON COMMIT DROP");
        statement.execute(
            "CREATE TEMP TABLE chef_profiles (id BIGINT, user_id BIGINT, created_at BIGINT) ON COMMIT DROP");
        statement.execute(
            "INSERT INTO users VALUES (1),(2),(3); INSERT INTO roles VALUES (1,'ROLE_CHEF',true); INSERT INTO user_roles VALUES (1,1,true),(2,1,false); INSERT INTO chef_profiles VALUES (1,1,100),(2,2,200),(3,3,300)");
        try (var input =
            getClass().getResourceAsStream("/db/changes/007-chef-application-review.sql")) {
          statement.execute(new String(input.readAllBytes(), StandardCharsets.UTF_8));
        }
        try (var result =
            statement.executeQuery(
                "SELECT review_status, submitted_at, status_changed_by FROM chef_profiles ORDER BY id")) {
          assertThat(result.next()).isTrue();
          assertThat(result.getString(1)).isEqualTo("APPROVED");
          assertThat(result.getLong(2)).isEqualTo(100);
          assertThat(result.getObject(3)).isNull();
          assertThat(result.next()).isTrue();
          assertThat(result.getString(1)).isEqualTo("PENDING");
          assertThat(result.next()).isTrue();
          assertThat(result.getString(1)).isEqualTo("PENDING");
        }
      } finally {
        connection.rollback();
      }
    }
  }

  private User createUser(RoleEnum role) {
    return users.saveAndFlush(
        User.builder()
            .username("Chef review test")
            .email("chef-review-" + UUID.randomUUID() + "@example.invalid")
            .password("not-a-login-password")
            .phone("0900000000")
            .roles(new java.util.ArrayList<>(List.of(roles.findRoleByRoleName(role).orElseThrow())))
            .build());
  }

  @Test
  @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
  void concurrentRequestsDoNotDuplicateApplicationsOrRoles() throws Exception {
    User user = createUser(RoleEnum.ROLE_USER);
    try {
      var location = jdbc.queryForMap("SELECT code, province_code FROM wards LIMIT 1");
      var request =
          mapper.convertValue(
              Map.of(
                  "phone",
                  "0912345678",
                  "experienceYears",
                  2,
                  "provinceCode",
                  location.get("province_code"),
                  "wardCode",
                  location.get("code")),
              BecomeChefRequest.class);
      assertThat(runTwice(() -> service.submit(user.getId(), request))).isEqualTo(1);
      Long id = service.ownApplication(user.getId()).getId();
      assertThat(
              runTwice(
                  () -> service.review(id, user.getId(), ChefApplicationStatus.APPROVED, null)))
          .isEqualTo(1);
      assertThat(chefGrants(user)).isEqualTo(1);
      assertThat(service.detail(id).getStatus()).isEqualTo(ChefApplicationStatus.APPROVED);
      // An inactive legacy grant is reactivated on restoration, without inserting another row.
      service.review(id, user.getId(), ChefApplicationStatus.SUSPENDED, "Test suspension");
      jdbc.update(
          "UPDATE user_roles SET is_active=false WHERE user_id=? AND role_id=(SELECT id FROM roles WHERE role_name='ROLE_CHEF')",
          user.getId());
      service.review(id, user.getId(), ChefApplicationStatus.APPROVED, null);
      assertThat(chefGrants(user)).isEqualTo(1);
      assertThat(
              jdbc.queryForObject(
                  "SELECT count(*) FROM chef_profiles WHERE user_id=?",
                  Integer.class,
                  user.getId()))
          .isEqualTo(1);
    } finally {
      // Delete only this test's UUID account and its own fixture rows.
      jdbc.update("DELETE FROM chef_profiles WHERE user_id=?", user.getId());
      jdbc.update("DELETE FROM user_roles WHERE user_id=?", user.getId());
      users.deleteById(user.getId());
    }
  }

  private long runTwice(Runnable action) throws Exception {
    try (var executor = java.util.concurrent.Executors.newFixedThreadPool(2)) {
      var ready = new java.util.concurrent.CountDownLatch(2);
      java.util.concurrent.Callable<Boolean> task =
          () -> {
            ready.countDown();
            ready.await();
            try {
              action.run();
              return true;
            } catch (IllegalArgumentException expected) {
              return false;
            }
          };
      var first = executor.submit(task);
      var second = executor.submit(task);
      return (first.get(15, java.util.concurrent.TimeUnit.SECONDS) ? 1 : 0)
          + (second.get(15, java.util.concurrent.TimeUnit.SECONDS) ? 1 : 0);
    }
  }

  private int chefGrants(User user) {
    return jdbc.queryForObject(
        "SELECT count(*) FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=? AND ur.is_active=true AND r.role_name='ROLE_CHEF'",
        Integer.class,
        user.getId());
  }

  private ChefReviewRequest review(String status, String reason) {
    var values = new java.util.HashMap<String, String>();
    values.put("status", status);
    values.put("reason", reason);
    return mapper.convertValue(values, ChefReviewRequest.class);
  }

  private void authenticate(User user, RoleEnum... authorities) {
    var granted =
        java.util.Arrays.stream(authorities)
            .map(r -> new SimpleGrantedAuthority(r.name()))
            .toList();
    var principal = SecurityUserDetails.build(user, new java.util.ArrayList<>(granted));
    SecurityContextHolder.getContext()
        .setAuthentication(new UsernamePasswordAuthenticationToken(principal, null, granted));
  }
}
