package com.james.LMS.response;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@ToString
public class CategoryResponse {
  private Long id;
  private String name;
}
