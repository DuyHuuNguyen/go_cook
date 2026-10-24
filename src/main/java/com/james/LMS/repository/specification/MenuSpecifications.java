package com.james.LMS.repository.specification;

import com.james.LMS.entity.ChefProfile;
import com.james.LMS.entity.Dish;
import com.james.LMS.entity.Menu;
import com.james.LMS.entity.MenuDish;
import com.james.LMS.enums.ChefApplicationStatus;
import com.james.LMS.request.MenuSearchRequest;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;

public final class MenuSpecifications {
  private MenuSpecifications() {}

  public static Specification<Menu> listedMenus(MenuSearchRequest request) {
    return (root, query, builder) -> {
      List<Predicate> predicates = new ArrayList<>();
      predicates.add(builder.isTrue(root.get("isActive")));
      predicates.add(root.get("status").in("PUBLISHED", "ACTIVE"));
      predicates.add(builder.isTrue(root.get("seller").get("isActive")));
      predicates.add(approvedChef(root, query.subquery(Long.class), builder));

      if (request.getCategoryId() != null) {
        predicates.add(builder.equal(root.get("category").get("id"), request.getCategoryId()));
      }
      if (request.getMinPrice() != null) {
        predicates.add(builder.greaterThanOrEqualTo(root.get("tempPrice"), request.getMinPrice()));
      }
      if (request.getMaxPrice() != null) {
        predicates.add(builder.lessThanOrEqualTo(root.get("tempPrice"), request.getMaxPrice()));
      }
      if (request.getDiners() != null) {
        predicates.add(builder.lessThanOrEqualTo(root.get("minGuests"), request.getDiners()));
        predicates.add(builder.greaterThanOrEqualTo(root.get("maxGuests"), request.getDiners()));
      }

      String keyword = normalizeKeyword(request.getKeyword());
      if (keyword != null) {
        String pattern = "%" + escapeLike(keyword) + "%";
        Predicate nameMatch = builder.like(builder.lower(root.get("name")), pattern, '\\');
        Predicate descriptionMatch =
            builder.like(builder.lower(root.get("description")), pattern, '\\');
        predicates.add(
            builder.or(
                nameMatch,
                descriptionMatch,
                dishNameMatches(root, query.subquery(Long.class), builder, pattern)));
      }

      return builder.and(predicates.toArray(Predicate[]::new));
    };
  }

  private static Predicate approvedChef(
      Root<Menu> menu, Subquery<Long> subquery, CriteriaBuilder builder) {
    Root<ChefProfile> profile = subquery.from(ChefProfile.class);
    subquery
        .select(profile.get("id"))
        .where(
            builder.equal(profile.get("user").get("id"), menu.get("seller").get("id")),
            builder.isTrue(profile.get("isActive")),
            builder.equal(profile.get("reviewStatus"), ChefApplicationStatus.APPROVED));
    return builder.exists(subquery);
  }

  private static Predicate dishNameMatches(
      Root<Menu> menu, Subquery<Long> subquery, CriteriaBuilder builder, String pattern) {
    Root<MenuDish> menuDish = subquery.from(MenuDish.class);
    var dish = menuDish.<MenuDish, Dish>join("dish");
    subquery
        .select(menuDish.get("id"))
        .where(
            builder.equal(menuDish.get("menu").get("id"), menu.get("id")),
            builder.isTrue(menuDish.get("isActive")),
            builder.isTrue(dish.get("isActive")),
            builder.like(builder.lower(dish.get("name")), pattern, '\\'));
    return builder.exists(subquery);
  }

  private static String normalizeKeyword(String keyword) {
    if (keyword == null || keyword.isBlank()) {
      return null;
    }
    return keyword.trim().toLowerCase(Locale.ROOT);
  }

  private static String escapeLike(String value) {
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
  }
}
