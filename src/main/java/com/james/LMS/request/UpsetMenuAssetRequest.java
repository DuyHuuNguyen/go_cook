package com.james.LMS.request;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class UpsetMenuAssetRequest {
  private Long menuId;
  private MultipartFile file;
}
