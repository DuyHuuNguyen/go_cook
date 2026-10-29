package com.james.LMS.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminDishUpdateRequest {
  @NotBlank
  @Size(max = 255)
  private String name;
}
