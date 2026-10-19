package com.james.LMS.response;

import java.math.BigDecimal;
import java.util.List;

/** Public, read-only data for the GoCook landing page. No User/Entity is serialized. */
public record HomeResponse(
    List<CategoryItem> categories,
    List<MenuItem> menus,
    List<ChefItem> chefs) {

  public record CategoryItem(Long id, String name) {}

  public record MenuItem(
      Long id,
      String name,
      String description,
      BigDecimal referencePrice,
      Integer minGuests,
      Integer maxGuests,
      Long categoryId,
      String categoryName,
      Long chefId,
      String chefName,
      String imageUrl) {}

  public record ChefItem(
      Long id,
      String name,
      String avatarUrl,
      String bio,
      Integer experienceYears) {}
}
