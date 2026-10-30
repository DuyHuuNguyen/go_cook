package com.james.LMS.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DishSearchRequest {
  @NotBlank
  @Size(max = 255)
  private String keyword;

  @Min(1)
  private int page = 1;

  @Min(1)
  @Max(100)
  private int size = 10;
}
