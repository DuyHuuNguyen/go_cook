package com.james.LMS.dto;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record ModificationMenuDTO(String name,
                                  BigDecimal tempPrice,
                                  Integer minGuests,
                                  Integer maxGuests,
                                  String description,
                                  String status) {
}
