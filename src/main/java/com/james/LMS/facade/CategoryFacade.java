package com.james.LMS.facade;

import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.CategoryResponse;
import com.james.LMS.response.KeySetPaginationResponse;

public interface CategoryFacade {

  BaseResponse<KeySetPaginationResponse<CategoryResponse>> findByLastId(Long lastId);
}
