package com.james.LMS.request;

import com.james.LMS.enums.ChefApplicationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ChefReviewRequest {
  @NotNull private ChefApplicationStatus status;

  @Size(max = 1000)
  private String reason;
}
