package com.james.LMS.response;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Getter
public class MenuAssetResponse {
  private Long id;
  private String url;
}
