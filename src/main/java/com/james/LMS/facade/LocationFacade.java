package com.james.LMS.facade;

import com.james.LMS.request.WardCriteria;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ProvinceResponse;
import com.james.LMS.response.WardResponse;
import java.util.List;

public interface LocationFacade {
  BaseResponse<List<ProvinceResponse>> findAllProvinces();

  BaseResponse<List<WardResponse>> findByWardName(WardCriteria criteria);
}
