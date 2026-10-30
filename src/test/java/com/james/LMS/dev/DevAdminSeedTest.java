package com.james.LMS.dev;

import static org.assertj.core.api.Assertions.assertThat;

import com.james.LMS.entity.ChefProfile;
import com.james.LMS.entity.Role;
import com.james.LMS.entity.User;
import com.james.LMS.entity.location.Ward;
import com.james.LMS.enums.ChefApplicationStatus;
import com.james.LMS.enums.RoleEnum;
import com.james.LMS.repository.ChefProfileRepository;
import com.james.LMS.repository.RoleRepository;
import com.james.LMS.repository.UserRepository;
import com.james.LMS.repository.WardRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.support.TransactionTemplate;

/** Explicit local-development seed; never participates in regular tests or production startup. */
@SpringBootTest(
    properties = {
      "spring.rabbitmq.listener.simple.auto-startup=false",
      "spring.rabbitmq.listener.direct.auto-startup=false"
    })
@EnabledIfEnvironmentVariable(named = "GOCOOK_SEED_DEV", matches = "true")
@ActiveProfiles("dev")
class DevAdminSeedTest {
  private static final String DOMAIN = "@example.invalid";
  private static final List<Fixture> FIXTURES =
      List.of(
          new Fixture("01", "Nguyễn Minh An", "0908800101", null, false),
          new Fixture("02", "Trần Thảo Vy", "0908800102", null, false),
          new Fixture("03", "Lê Quốc Bảo", "0908800103", null, false),
          new Fixture("04", "Phạm Ngọc Hà", "0908800104", null, false),
          new Fixture("05", "Đỗ Thanh Bình", "0908800105", null, true),
          new Fixture("06", "Võ Mỹ Linh", "0908800106", null, true),
          new Fixture("07", "Bùi Gia Huy", "0908800107", ChefApplicationStatus.PENDING, false),
          new Fixture("08", "Đặng Thu Mai", "0908800108", ChefApplicationStatus.PENDING, false),
          new Fixture("09", "Hoàng Hữu Nam", "0908800109", ChefApplicationStatus.APPROVED, false),
          new Fixture("10", "Ngô Bảo Châu", "0908800110", ChefApplicationStatus.APPROVED, false),
          new Fixture("11", "Mai Quỳnh Anh", "0908800111", ChefApplicationStatus.REJECTED, false),
          new Fixture("12", "Phan Đức Phúc", "0908800112", ChefApplicationStatus.SUSPENDED, false));

  @Autowired DataSource dataSource;
  @Autowired Environment environment;
  @Autowired TransactionTemplate transactions;
  @Autowired UserRepository users;
  @Autowired RoleRepository roles;
  @Autowired ChefProfileRepository profiles;
  @Autowired WardRepository wards;
  @Autowired PasswordEncoder encoder;

  @Test
  void seedOnlyLocalDevelopmentAccountsWithoutOverwritingExistingUsers() throws Exception {
    assertThat(environment.getActiveProfiles()).contains("dev");
    try (var connection = dataSource.getConnection()) {
      assertThat(connection.getMetaData().getURL())
          .matches("jdbc:postgresql://(localhost|127\\.0\\.0\\.1):[0-9]+/app_db.*");
    }
    String suppliedPassword = System.getenv("GOCOOK_DEV_SEED_PASSWORD");
    if (suppliedPassword != null && suppliedPassword.length() < 12) {
      throw new IllegalArgumentException("GOCOOK_DEV_SEED_PASSWORD phải có ít nhất 12 ký tự.");
    }
    transactions.executeWithoutResult(
        ignored -> {
          Role userRole = roles.findRoleByRoleName(RoleEnum.ROLE_USER).orElseThrow();
          Role chefRole = roles.findRoleByRoleName(RoleEnum.ROLE_CHEF).orElseThrow();
          User admin = users.findByEmail("systemadmin@gmail.com").orElseThrow();
          assertThat(roles.findAllByUserId(admin.getId()))
              .extracting(Role::getRoleName)
              .contains(RoleEnum.ROLE_SYSTEM_ADMIN);
          List<Ward> locations = wards.findAll(PageRequest.of(0, 12, Sort.by("code"))).getContent();
          assertThat(locations).hasSize(12);
          for (int index = 0; index < FIXTURES.size(); index++) {
            Fixture fixture = FIXTURES.get(index);
            String email = "gocook-dev-" + fixture.number() + DOMAIN;
            if (users.existsUserByEmail(email)) continue;
            Ward location = locations.get(index);
            List<Role> assignedRoles = new ArrayList<>(List.of(userRole));
            if (fixture.chefStatus() == ChefApplicationStatus.APPROVED
                || fixture.chefStatus() == ChefApplicationStatus.SUSPENDED) {
              assignedRoles.add(chefRole);
            }
            String password =
                suppliedPassword == null ? UUID.randomUUID().toString() : suppliedPassword;
            User user =
                users.saveAndFlush(
                    User.builder()
                        .username(fixture.name())
                        .email(email)
                        .phone(fixture.phone())
                        .password(encoder.encode(password))
                        .province(location.getProvince())
                        .ward(location)
                        .addressDetail("Khu vực " + location.getFullName())
                        .roles(assignedRoles)
                        .build());
            if (fixture.locked()) {
              user.lock("Tài khoản development bị khóa để kiểm thử quản trị.", admin.getId());
              users.saveAndFlush(user);
            }
            if (fixture.chefStatus() != null) {
              ChefApplicationStatus status = fixture.chefStatus();
              String reason =
                  status == ChefApplicationStatus.REJECTED
                      ? "Cần bổ sung thông tin kinh nghiệm và giới thiệu."
                      : status == ChefApplicationStatus.SUSPENDED
                          ? "Tạm ngừng hoạt động để kiểm tra chất lượng dịch vụ."
                          : null;
              long now = System.currentTimeMillis();
              profiles.saveAndFlush(
                  ChefProfile.builder()
                      .user(user)
                      .bio("Hồ sơ thử nghiệm cho " + fixture.name() + ", chuyên món ăn gia đình.")
                      .experienceYears(index % 5 + 2)
                      .reviewStatus(status)
                      .reviewReason(reason)
                      .submittedAt(now - (12L - index) * 86_400_000L)
                      .statusChangedAt(now)
                      .statusChangedBy(
                          status == ChefApplicationStatus.PENDING ? user.getId() : admin.getId())
                      .build());
            }
          }
          assertThat(
                  FIXTURES.stream()
                      .map(f -> users.findByEmail("gocook-dev-" + f.number() + DOMAIN))
                      .filter(java.util.Optional::isPresent)
                      .count())
              .isEqualTo(FIXTURES.size());
        });
  }

  private record Fixture(
      String number, String name, String phone, ChefApplicationStatus chefStatus, boolean locked) {}
}
