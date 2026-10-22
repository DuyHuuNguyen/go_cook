package com.james.LMS.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class WardCriteria extends BaseCriteria {
  @Size(max = 20, message = "ward name must not exceed 20 characters")
  private String wardName;
}
