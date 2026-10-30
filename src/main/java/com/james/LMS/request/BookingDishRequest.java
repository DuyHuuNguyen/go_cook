package com.james.LMS.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingDishRequest {
  @NotNull @Positive private Long dishId;

  @NotNull @Positive private Integer quantity;
}
