package com.james.LMS.response;

import com.james.LMS.dto.ChefProfileDTO;
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
  private Boolean isChef;
  private ChefProfileDTO chefProfile;
  private List<String> roles;
}
