package com.james.LMS.facade.impl;

import com.james.LMS.facade.CategoryFacade;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.CategoryResponse;
import com.james.LMS.response.KeySetPaginationResponse;
import com.james.LMS.service.CategoryService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryFacadeImpl implements CategoryFacade {
  private final CategoryService categoryService;

  @Override
  public BaseResponse<KeySetPaginationResponse<CategoryResponse>> findByLastId(Long lastId) {
    List<CategoryResponse> categoryResponses =
        this.categoryService.findByIdGreaterThanOrderById(lastId).stream()
            .map(
                category ->
                    CategoryResponse.builder()
                        .id(category.getId())
                        .name(category.getName())
                        .build())
            .toList();

    boolean hasNext = !categoryResponses.isEmpty();
    lastId = hasNext ? categoryResponses.getLast().getId() : -1l;

    var paginationResponse =
        KeySetPaginationResponse.<CategoryResponse>builder()
            .data(categoryResponses)
            .lastId(lastId)
            .hasNext(hasNext)
            .build();
    return BaseResponse.build(paginationResponse, true);
  }
}
