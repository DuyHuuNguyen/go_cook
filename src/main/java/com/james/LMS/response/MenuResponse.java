package com.james.LMS.response;

import java.math.BigDecimal;
import java.util.List;

public record MenuResponse(
    Long id,
    String name,
    String description,
    BigDecimal tempPrice,
    Integer minGuests,
    Integer maxGuests,
    String status,
    CategorySummary category,
    SellerSummary seller,
    List<DishSummary> dishes,
    List<String> imageUrls) {
  public record DishSummary(Long id, String name) {}

  public record CategorySummary(Long id, String name) {}

  public record SellerSummary(Long id, String username, String avatarUrl) {}
}
