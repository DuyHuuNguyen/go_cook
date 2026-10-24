package com.james.LMS.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class AdminUserStatusRequest {
  @NotBlank private String status;
  private String reason;
}
