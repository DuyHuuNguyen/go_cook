package com.james.LMS.facade.impl;

import com.james.LMS.facade.MenuFacade;
import com.james.LMS.request.MenuSearchRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.MenuResponse;
import com.james.LMS.response.PaginationResponse;
import com.james.LMS.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MenuFacadeImpl implements MenuFacade {
  private final MenuService menuService;

  @Override
  public BaseResponse<PaginationResponse<MenuResponse>> findMenus(MenuSearchRequest request) {
    return BaseResponse.build(PaginationResponse.from(menuService.findMenus(request)), true);
  }
}
