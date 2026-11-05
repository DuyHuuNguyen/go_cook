package com.james.LMS.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record MatchingChefResponse(
    Long chefId,
    String fullName,
    String bio,
    @JsonProperty("experience_years") String experienceYears,
    String avatar,
    int matchedDishCount,
    int totalRequestedDishCount,
    List<DishItem> matchedDishes,
    List<DishItem> unmatchedDishes) {
  public record DishItem(Long dishId, String dishName) {}
}
