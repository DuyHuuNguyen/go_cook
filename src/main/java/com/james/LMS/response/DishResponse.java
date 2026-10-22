package com.james.LMS.response;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@ToString
public class DishResponse {
  private Long id;
  private String name;
}
