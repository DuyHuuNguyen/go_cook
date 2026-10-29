package com.james.LMS.facade.impl;

import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.entity.Dish;
import com.james.LMS.entity.User;
import com.james.LMS.enums.ErrorCode;
import com.james.LMS.exception.EntityNotFoundException;
import com.james.LMS.facade.DishFacade;
import com.james.LMS.request.DishSearchRequest;
import com.james.LMS.request.UpsertDishRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.DishResponse;
import com.james.LMS.response.KeySetPaginationResponse;
import com.james.LMS.response.PaginationResponse;
import com.james.LMS.service.ChefApplicationService;
import com.james.LMS.service.DishService;
import com.james.LMS.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DishFacadeImpl implements DishFacade {
  private final DishService dishService;
  private final UserService userService;
  private final ChefApplicationService chefApplicationService;

  @Override
  public BaseResponse<KeySetPaginationResponse<DishResponse>> findByLastId(
      Long lastId, String name) {
    SecurityUserDetails principal = SecurityUserDetails.getPrincipal();

    List<DishResponse> dishResponses =
        this.dishService.findByIdGreaterThanOrderById(lastId, principal.getId(), name).stream()
            .map(
                category ->
                    DishResponse.builder().id(category.getId()).name(category.getName()).build())
            .toList();
    boolean hasNext = !dishResponses.isEmpty();
    lastId = hasNext ? dishResponses.getLast().getId() : -1l;

    var paginationResponse =
        KeySetPaginationResponse.<DishResponse>builder()
            .data(dishResponses)
            .lastId(lastId)
            .hasNext(hasNext)
            .build();
    return BaseResponse.build(paginationResponse, true);
  }

  @Override
  public BaseResponse<PaginationResponse<DishResponse>> searchByName(DishSearchRequest request) {
    var page =
        dishService
            .searchByName(
                request.getName(),
                org.springframework.data.domain.PageRequest.of(
                    request.getPage() - 1, request.getSize()))
            .map(dish -> DishResponse.builder().id(dish.getId()).name(dish.getName()).build());
    return BaseResponse.build(PaginationResponse.from(page), true);
  }

  @Override
  @Transactional
  public BaseResponse<Void> createDish(UpsertDishRequest request) {
    SecurityUserDetails principal = SecurityUserDetails.getPrincipal();
    chefApplicationService.requireApprovedSeller(principal.getId());

    User chef =
        this.userService
            .findById(principal.getId())
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));

    Dish dish = Dish.builder().name(request.getName()).chef(chef).build();

    this.dishService.save(dish);

    return BaseResponse.ok();
  }
}
