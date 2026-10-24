package com.james.LMS.response;

import com.james.LMS.entity.ChefProfile;
import com.james.LMS.enums.ChefApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChefApplicationResponse {
  private final Long id;
  private final Long userId;
  private final String username;
  private final String email;
  private final String phone;
  private final String provinceCode;
  private final String wardCode;
  private final String bio;
  private final Integer experienceYears;
  private final ChefApplicationStatus status;
  private final String reason;
  private final Long submittedAt;
  private final Long statusChangedAt;
  private final Long statusChangedBy;

  public static ChefApplicationResponse from(ChefProfile profile) {
    var user = profile.getUser();
    return new ChefApplicationResponse(
        profile.getId(),
        user.getId(),
        user.getUsername(),
        user.getEmail(),
        user.getPhone(),
        user.getProvince() == null ? null : user.getProvince().getCode(),
        user.getWard() == null ? null : user.getWard().getCode(),
        profile.getBio(),
        profile.getExperienceYears(),
        profile.getReviewStatus(),
        profile.getReviewReason(),
        profile.getSubmittedAt(),
        profile.getStatusChangedAt(),
        profile.getStatusChangedBy());
  }
}
