package com.james.LMS.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@ToString
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class BecomeChefRequest {

  @NotBlank(message = "Phone must not be blank")
  @Pattern(
          regexp = "^[0-9]{10,11}$",
          message = "Phone must contain 10 to 11 digits"
  )
  private String phone;

  @NotBlank(message = "Province code must not be blank")
  private String provinceCode;

  @NotBlank(message = "Ward code must not be blank")
  private String wardCode;

  @Size(max = 500, message = "Bio must not exceed 500 characters")
  private String bio;

  @PositiveOrZero(message = "Experience years must be zero or greater")
  private Integer experienceYears;
}
