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
public class ExploreChefDetailResponse {
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
  private List<ServiceAreaItem> serviceAreas;
  private List<MenuResponse> menus;

  private Integer totalBookings;
  private Integer totalSuccessfullyBookings;
  private Integer totalMenus;

  @AllArgsConstructor
  @NoArgsConstructor
  @Builder
  @Getter
  public static class ServiceAreaItem {
    private String provinceCode;
    private String provinceName;
    private String wardCode;
    private String wardName;
  }
}

