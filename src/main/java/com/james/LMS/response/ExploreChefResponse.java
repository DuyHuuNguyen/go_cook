package com.james.LMS.response;

import com.james.LMS.dto.DishDTO;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
public class ExploreChefResponse {
  private Long userId;
  private String username;
  private String phone;
  private String email;
  private String avatarUrl;

  private String bio;
  private Integer experienceYears;
  private String reviewReason;
  private LocalDateTime onboardedAt;

  private List<DishDTO> dishes;
  private Integer totalBookings;
  private Integer totalSuccessfullyBookings;
}
