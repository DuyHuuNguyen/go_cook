package com.james.LMS.facade;

import com.james.LMS.request.MenuOfChefRequest;
import com.james.LMS.request.MenuSearchRequest;
import com.james.LMS.request.UpsetMenuAssetRequest;
import com.james.LMS.request.UpsetMenuRequest;
import com.james.LMS.response.*;

public interface MenuFacade {
  BaseResponse<PaginationResponse<MenuResponse>> findMenus(MenuSearchRequest request);

  BaseResponse<Void> createMenu(UpsetMenuRequest request);

  BaseResponse<Void> addMenuAssets(UpsetMenuAssetRequest request);

  BaseResponse<PaginationResponse<MenuResponse>> findAllMenuOfChef(MenuOfChefRequest request);

  BaseResponse<KeySetPaginationResponse<MenuResponse>> findByLastId(Long lastId);

  BaseResponse<KeySetPaginationResponse<MenuAssetResponse>> findAllAssets(
      Long menuId, Long lastAssetId);

  BaseResponse<Void> removeMenuAsset(Long menuId, Long assetId);

  BaseResponse<Void> editMenu(UpsetMenuRequest request);
}
