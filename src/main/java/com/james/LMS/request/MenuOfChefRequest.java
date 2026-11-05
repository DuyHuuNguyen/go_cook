package com.james.LMS.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MenuOfChefRequest extends BaseCriteria {
  @Positive private Integer currentPage;

  @Positive
  @Max(30)
  private Integer pageSize;
}
