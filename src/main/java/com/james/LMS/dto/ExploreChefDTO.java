package com.james.LMS.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@ToString
public class ExploreChefDTO {
  private Long userId;
  private String username;
  private String phone;
  private String email;
  private String avatarUrl;

  private String bio;
  private Integer experienceYears;
  private String reviewReason;
  private Long onboardedAt;
}
