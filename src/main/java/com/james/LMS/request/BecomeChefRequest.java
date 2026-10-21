package com.james.LMS.request;

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

    private String phone;

    private String provinceCode;

    private String wardCode;

    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;

    @PositiveOrZero
    private Integer experienceYears;
}
