package com.james.LMS.facade;

import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.MenuResponse;
import com.james.LMS.response.PaginationResponse;

public interface MenuFacade {
  BaseResponse<PaginationResponse<MenuResponse>> findMenus(int page, int size);
}
