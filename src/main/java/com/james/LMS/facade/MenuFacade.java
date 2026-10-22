package com.james.LMS.facade;

import com.james.LMS.request.MenuSearchRequest;
import com.james.LMS.request.UpsetMenuAssetRequest;
import com.james.LMS.request.UpsetMenuRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.MenuResponse;
import com.james.LMS.response.PaginationResponse;

public interface MenuFacade {
  BaseResponse<PaginationResponse<MenuResponse>> findMenus(MenuSearchRequest request);

  BaseResponse<Void> createMenu(UpsetMenuRequest request);

  BaseResponse<Void> addMenuAssets(UpsetMenuAssetRequest request);
}
