package com.james.LMS.response;

import java.util.List;

import lombok.*;
import org.springframework.data.domain.Page;

@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class PaginationResponse<T> {
  private List<T> data;
  private int currentPage;
  private long totalElements;
  private int totalPages;
  private int pageSize;
  private int numberOfElements;
  private boolean first;
  private boolean last;
  private boolean hasNext;
  private boolean hasPrevious;
  private boolean empty;

  public static <T> PaginationResponse<T> from(Page<T> page) {
    return PaginationResponse.<T>builder()
        .data(page.getContent())
        .currentPage(page.getNumber() + 1)
        .totalElements(page.getTotalElements())
        .totalPages(page.getTotalPages())
        .pageSize(page.getSize())
        .numberOfElements(page.getNumberOfElements())
        .first(page.isFirst())
        .last(page.isLast())
        .hasNext(page.hasNext())
        .hasPrevious(page.hasPrevious())
        .empty(page.isEmpty())
        .build();
  }
}
