package com.james.LMS.response;

public record AdminDishResponse(
        Long id,
        String name,
        Boolean isActive,
        Long chefId,
        String chefName,
        Long createdAt,
        Long updatedAt,
        String moderationSource,
        String moderationReason) { }
