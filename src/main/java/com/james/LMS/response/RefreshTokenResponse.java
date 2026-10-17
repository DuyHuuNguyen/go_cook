package com.james.LMS.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Getter
@NoArgsConstructor
@Builder
public class RefreshTokenResponse {
  private String refreshToken;
  private String accessToken;
}
