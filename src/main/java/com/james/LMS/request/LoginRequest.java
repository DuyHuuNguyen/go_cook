package com.james.LMS.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class LoginRequest {
  @Email(message = "Email invalid")
  @NotBlank
  @Schema(defaultValue = "systemadmin@gmail.com")
  private String email;
  @Schema(defaultValue = "systemadmin")
  @NotBlank private String password;
}
