package com.james.LMS.menu;

import static org.assertj.core.api.Assertions.assertThat;

import com.james.LMS.controller.HomeController;
import com.james.LMS.controller.MenuController;
import com.james.LMS.entity.Category;
import com.james.LMS.entity.ChefProfile;
import com.james.LMS.entity.Menu;
import com.james.LMS.entity.User;
import com.james.LMS.enums.ChefApplicationStatus;
import com.james.LMS.repository.CategoryRepository;
import com.james.LMS.repository.ChefProfileRepository;
import com.james.LMS.repository.MenuRepository;
import com.james.LMS.repository.UserRepository;
import com.james.LMS.request.MenuSearchRequest;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.UUID;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

/** Uses the already running local PostgreSQL; all fixtures roll back. */
@SpringBootTest(
    properties = {
      "spring.rabbitmq.listener.simple.auto-startup=false",
      "spring.rabbitmq.listener.direct.auto-startup=false"
    })
@EnabledIfEnvironmentVariable(named = "GOCOOK_MENU_INTEGRATION", matches = "true")
@Transactional
class PublicMenuVisibilityIntegrationTest {
  @Autowired private DataSource dataSource;
  @Autowired private EntityManager entityManager;
  @Autowired private UserRepository users;
  @Autowired private CategoryRepository categories;
  @Autowired private ChefProfileRepository profiles;
  @Autowired private MenuRepository menus;
  @Autowired private MenuController menuController;
  @Autowired private HomeController homeController;

  @Test
  void publicListingAndHomeRequireActiveApprovedChefAndVisibleMenu() throws Exception {
    try (var connection = dataSource.getConnection()) {
      assertThat(connection.getMetaData().getURL()).startsWith("jdbc:postgresql://localhost:");
    }
    String name = "Visibility " + UUID.randomUUID();
    User seller =
        users.saveAndFlush(
            User.builder()
                .email("menu-visibility-" + UUID.randomUUID() + "@example.invalid")
                .username("Chef Test")
                .password("unused")
                .phone("0900000000")
                .build());
    Category category = categories.saveAndFlush(Category.builder().name("Visibility test").build());
    ChefProfile chef =
        profiles.saveAndFlush(
            ChefProfile.builder()
                .user(seller)
                .bio("Test")
                .experienceYears(2)
                .reviewStatus(ChefApplicationStatus.APPROVED)
                .build());
    Menu menu =
        menus.saveAndFlush(
            Menu.builder()
                .name(name)
                .seller(seller)
                .category(category)
                .status("ACTIVE")
                .tempPrice(new BigDecimal("200000"))
                .minGuests(2)
                .maxGuests(8)
                .build());
    Long id = menu.getId();
    MenuSearchRequest request = new MenuSearchRequest();
    request.setKeyword(name);
    request.setCategoryId(category.getId());
    request.setMinPrice(new BigDecimal("100000"));
    request.setMaxPrice(new BigDecimal("300000"));
    request.setDiners(4);
    assertPublic(id, request, true);

    chef.setReviewStatus(ChefApplicationStatus.SUSPENDED);
    flush();
    assertPublic(id, request, false);
    chef.setReviewStatus(ChefApplicationStatus.PENDING);
    flush();
    assertPublic(id, request, false);
    chef.setReviewStatus(ChefApplicationStatus.REJECTED);
    flush();
    assertPublic(id, request, false);

    chef.setReviewStatus(ChefApplicationStatus.APPROVED);
    flush();
    assertPublic(id, request, true);
    menu.setStatus("HIDDEN");
    flush();
    assertPublic(id, request, false);

    menu.setStatus("ACTIVE");
    flush();
    entityManager
        .createNativeQuery("UPDATE users SET is_active=false WHERE id=:id")
        .setParameter("id", seller.getId())
        .executeUpdate();
    entityManager.clear();
    assertPublic(id, request, false);
    entityManager
        .createNativeQuery("UPDATE users SET is_active=true WHERE id=:id")
        .setParameter("id", seller.getId())
        .executeUpdate();
    entityManager.clear();
    assertPublic(id, request, true);
    entityManager
        .createNativeQuery("UPDATE chef_profiles SET is_active=false WHERE id=:id")
        .setParameter("id", chef.getId())
        .executeUpdate();
    entityManager.clear();
    assertPublic(id, request, false);
    entityManager
        .createNativeQuery("DELETE FROM chef_profiles WHERE id=:id")
        .setParameter("id", chef.getId())
        .executeUpdate();
    entityManager.clear();
    assertPublic(id, request, false);
  }

  private void assertPublic(Long id, MenuSearchRequest request, boolean expected) {
    var listing = menuController.findMenus(request).getData();
    assertThat(listing.getTotalElements()).isEqualTo(expected ? 1 : 0);
    assertThat(listing.getData().stream().anyMatch(item -> item.id().equals(id)))
        .isEqualTo(expected);
    assertThat(
            homeController.getHome().getData().menus().stream()
                .anyMatch(item -> item.id().equals(id)))
        .isEqualTo(expected);
  }

  private void flush() {
    entityManager.flush();
  }
}
