package com.james.LMS.response;

import java.util.List;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@ToString
@Getter
@Builder
public class KeySetPaginationResponse<T> {
  private List<T> data;
  private Long lastId;
  private Boolean hasNext;
}
