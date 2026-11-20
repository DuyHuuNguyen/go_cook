package com.james.LMS.facade.impl;

import com.james.LMS.dto.DishDTO;
import com.james.LMS.dto.ExploreChefDTO;
import com.james.LMS.enums.ErrorCode;
import com.james.LMS.exception.EntityNotFoundException;
import com.james.LMS.facade.ExploreChefFacade;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ExploreChefDetailResponse;
import com.james.LMS.response.ExploreChefResponse;
import com.james.LMS.response.KeySetPaginationResponse;
import com.james.LMS.response.MenuResponse;
import com.james.LMS.service.BookingService;
import com.james.LMS.service.ChefProfileService;
import com.james.LMS.service.DishService;
import com.james.LMS.service.MenuService;
import com.james.LMS.service.UserService;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExploreChefFacadeImpl implements ExploreChefFacade {

  private final UserService userService;
  private final BookingService bookingService;
  private final DishService dishService;
  private final ChefProfileService chefProfileService;
  private final MenuService menuService;

  @Override
  @Transactional(readOnly = true)
  public BaseResponse<KeySetPaginationResponse<ExploreChefResponse>> findExploreChefByLastId(
      Long lastId) {
    long cursor = (lastId == null || lastId < 0) ? 0L : lastId;
    List<ExploreChefDTO> exploreChefDTOs = this.userService.findChefByLastId(cursor);

    if (exploreChefDTOs.isEmpty()) {
      return BaseResponse.build(
          KeySetPaginationResponse.<ExploreChefResponse>builder()
              .data(List.of())
              .lastId(-1L)
              .hasNext(false)
              .build(),
          true);
    }

    List<Long> chefIds = exploreChefDTOs.stream().map(ExploreChefDTO::getUserId).toList();
    Map<Long, List<DishDTO>> dishesByChefId = this.dishService.findDishesByChefIds(chefIds);
    Map<Long, BookingService.ChefBookingStats> statsByChefId =
        this.bookingService.findChefBookingStats(chefIds);

    List<ExploreChefResponse> chefResponses =
        exploreChefDTOs.stream()
            .map(dto -> toExploreChefResponse(dto, dishesByChefId, statsByChefId))
            .toList();

    Long nextLastId = chefResponses.getLast().getUserId();
    KeySetPaginationResponse<ExploreChefResponse> paginationResponse =
        KeySetPaginationResponse.<ExploreChefResponse>builder()
            .data(chefResponses)
            .lastId(nextLastId)
            .hasNext(true)
            .build();
    return BaseResponse.build(paginationResponse, true);
  }

  private ExploreChefResponse toExploreChefResponse(
      ExploreChefDTO dto,
      Map<Long, List<DishDTO>> dishesByChefId,
      Map<Long, BookingService.ChefBookingStats> statsByChefId) {
    BookingService.ChefBookingStats stats =
        statsByChefId.getOrDefault(dto.getUserId(), new BookingService.ChefBookingStats(0, 0));

    return ExploreChefResponse.builder()
        .userId(dto.getUserId())
        .username(dto.getUsername())
        .phone(dto.getPhone())
        .email(dto.getEmail())
        .avatarUrl(dto.getAvatarUrl())
        .bio(dto.getBio())
        .experienceYears(dto.getExperienceYears())
        .reviewReason(dto.getReviewReason())
        .onboardedAt(toLocalDateTime(dto.getOnboardedAt()))
        .dishes(dishesByChefId.getOrDefault(dto.getUserId(), List.of()))
        .totalBookings(stats.totalBookings())
        .totalSuccessfullyBookings(stats.totalSuccessfullyBookings())
        .build();
  }

  @Override
  @Transactional(readOnly = true)
  public BaseResponse<ExploreChefDetailResponse> findExploreChefDetailByChefId(Long chefId) {
    ExploreChefDTO chef =
        this.userService
            .findApprovedChefDetailByUserId(chefId)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.CHEF_PROFILE_NOT_FOUND));

    List<DishDTO> dishes =
        this.dishService.findDishesByChefIds(List.of(chefId)).getOrDefault(chefId, List.of());
    BookingService.ChefBookingStats stats =
        this.bookingService
            .findChefBookingStats(List.of(chefId))
            .getOrDefault(chefId, new BookingService.ChefBookingStats(0, 0));
    List<ExploreChefDetailResponse.ServiceAreaItem> serviceAreas =
        this.chefProfileService.findActiveServiceAreasByChefUserId(chefId).stream()
            .map(
                area ->
                    ExploreChefDetailResponse.ServiceAreaItem.builder()
                        .provinceCode(area.provinceCode())
                        .provinceName(area.provinceName())
                        .wardCode(area.wardCode())
                        .wardName(area.wardName())
                        .build())
            .toList();
    List<MenuResponse> menus = this.menuService.findPublicMenusByChefId(chefId);

    ExploreChefDetailResponse response =
        ExploreChefDetailResponse.builder()
            .userId(chef.getUserId())
            .username(chef.getUsername())
            .phone(chef.getPhone())
            .email(chef.getEmail())
            .avatarUrl(chef.getAvatarUrl())
            .bio(chef.getBio())
            .experienceYears(chef.getExperienceYears())
            .reviewReason(chef.getReviewReason())
            .onboardedAt(toLocalDateTime(chef.getOnboardedAt()))
            .dishes(dishes)
            .serviceAreas(serviceAreas)
            .menus(menus)
            .totalBookings(stats.totalBookings())
            .totalSuccessfullyBookings(stats.totalSuccessfullyBookings())
            .totalMenus(menus.size())
            .build();

    return BaseResponse.build(response, true);
  }

  private LocalDateTime toLocalDateTime(Long epochMillis) {
    if (epochMillis == null) {
      return null;
    }
    return Instant.ofEpochMilli(epochMillis).atZone(ZoneId.systemDefault()).toLocalDateTime();
  }
}
