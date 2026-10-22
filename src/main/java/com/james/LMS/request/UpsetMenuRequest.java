package com.james.LMS.request;

import io.swagger.v3.oas.annotations.Hidden;
import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@ToString
@Getter
public class UpsetMenuRequest {
  @Hidden private Long id;
  private String name;
  private BigDecimal tempPrice;
  private Integer minGuests;
  private Integer maxGuests;
  private String description;
  private String status;
  private Long categoryId;
  private List<Long> dishIds;
}
