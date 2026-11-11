package com.james.LMS.facade;

import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ExploreChefDetailResponse;
import com.james.LMS.response.ExploreChefResponse;
import com.james.LMS.response.KeySetPaginationResponse;

public interface ExploreChefFacade {

  BaseResponse<KeySetPaginationResponse<ExploreChefResponse>> findExploreChefByLastId(Long lastId);

  BaseResponse<ExploreChefDetailResponse> findExploreChefDetailByChefId(Long chefId);
}
