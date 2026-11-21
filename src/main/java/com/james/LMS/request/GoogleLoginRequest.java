package com.james.LMS.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class GoogleLoginRequest {
  @NotBlank(message = "Google ID token must not be blank")
  @Schema(
      description = "Google ID Token (credential) returned by Google Sign-In",
      example = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1NiJ9...")
  private String idToken;
}
