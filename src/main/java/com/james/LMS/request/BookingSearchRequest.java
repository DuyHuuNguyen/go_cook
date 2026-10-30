package com.james.LMS.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingSearchRequest {
  @Min(1)
  private int page = 1;

  @Min(1)
  @Max(100)
  private int size = 10;
}
