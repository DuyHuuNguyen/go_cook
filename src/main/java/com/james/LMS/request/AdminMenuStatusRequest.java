package com.james.LMS.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminMenuStatusRequest {
  @NotNull private Boolean isActive;

  @Size(max = 1000)
  private String reason;
}
