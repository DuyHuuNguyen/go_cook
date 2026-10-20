package com.james.LMS.request;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@ToString
public class UpsertUserRequest {
  @Hidden private Long id;

  @NotBlank private String username;

  @NotBlank
  @Size(max = 15)
  @Pattern(regexp = "\\+?[0-9]{9,15}", message = "Phone must contain 9 to 15 digits")
  private String phone;

  @Email(message = "Email invalid")
  @NotBlank
  private String email;

  @NotBlank
  @Size(min = 8, message = "Password must be at least 8 characters")
  private String password;
}
