package com.james.LMS.facade;

import com.james.LMS.request.UpsertDishRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.DishResponse;
import com.james.LMS.response.KeySetPaginationResponse;

public interface DishFacade {
  BaseResponse<KeySetPaginationResponse<DishResponse>> findByLastId(Long lastId);

  BaseResponse<Void> createDish(UpsertDishRequest request);
}
