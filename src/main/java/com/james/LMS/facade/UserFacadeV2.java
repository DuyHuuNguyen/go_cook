package com.james.LMS.facade;

import com.james.LMS.request.LoginRequest;
import com.james.LMS.request.RefreshTokenRequest;
import com.james.LMS.response.BaseResponse;
import jakarta.servlet.http.HttpServletResponse;

public interface UserFacadeV2 {

  BaseResponse<Void> login(LoginRequest loginRequest, HttpServletResponse response);

  BaseResponse<Void> refreshToken(
      RefreshTokenRequest refreshTokenRequest, HttpServletResponse response);

  BaseResponse<Void> logout(HttpServletResponse response);
}
