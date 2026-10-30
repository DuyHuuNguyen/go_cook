package com.james.LMS.response;

import java.math.BigDecimal;
import java.util.List;

public record AdminMenuResponse(
        Long id,
        String name,
        String description,
        BigDecimal tempPrice,
        Integer minGuests,
        Integer maxGuests,
        String status,
        Boolean isActive,
        Long createdAt,
        Long updatedAt,
        MenuResponse.CategorySummary category,
        MenuResponse.SellerSummary seller,
        List<MenuResponse.DishSummary> dishes,
        List<String> imageUrls,
        String moderationSource,
        String moderationReason) {}
