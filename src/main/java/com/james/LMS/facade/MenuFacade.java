package com.james.LMS.facade;

import com.james.LMS.request.UpsetMenuAssetRequest;
import com.james.LMS.request.UpsetMenuRequest;
import com.james.LMS.response.BaseResponse;

public interface MenuFacade {
  BaseResponse<Void> createMenu(UpsetMenuRequest request);

  BaseResponse<Void> addMenuAssets(UpsetMenuAssetRequest request);
}
