package com.james.LMS.response;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@ToString
@Getter
@Builder
public class ProvinceResponse {
  private String code;
  private String fullName;
}
