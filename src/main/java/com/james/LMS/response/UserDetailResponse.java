package com.james.LMS.response;

import com.james.LMS.dto.ChefProfileDTO;
import com.james.LMS.entity.ChefProfile;
import java.util.List;
import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@ToString
public class UserDetailResponse {
  private Long id;
  private String username;
  private String email;
  private Boolean emailVerified;
  private String avatarUrl;
  @Builder.Default private Boolean isChef = false;
  private ChefProfileDTO chefProfile;
  private List<String> roles;

  public void addChefInfo(ChefProfile chefProfile) {
    this.chefProfile =
        ChefProfileDTO.builder()
            .bio(chefProfile.getBio())
            .experienceYears(chefProfile.getExperienceYears())
            .build();
    this.isChef = true;
  }
}
