package com.james.LMS.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@ToString
@Builder
public class ChefProfileDTO {
    private String bio;
    private Integer experienceYears;
}
