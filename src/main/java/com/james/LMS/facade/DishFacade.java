package com.james.LMS.facade;

import com.james.LMS.request.DishSearchRequest;
import com.james.LMS.request.UpsertDishRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.DishResponse;
import com.james.LMS.response.KeySetPaginationResponse;
import com.james.LMS.response.PaginationResponse;

public interface DishFacade {
  BaseResponse<KeySetPaginationResponse<DishResponse>> findByLastId(Long lastId, String name);

  BaseResponse<PaginationResponse<DishResponse>> searchByName(DishSearchRequest request);

  BaseResponse<Void> createDish(UpsertDishRequest request);
}
