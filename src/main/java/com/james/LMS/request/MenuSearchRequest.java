package com.james.LMS.request;

import com.james.LMS.enums.MenuSort;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MenuSearchRequest {
  private String keyword;

  @Positive private Long categoryId;

  @DecimalMin("0.0")
  private BigDecimal minPrice;

  @DecimalMin("0.0")
  private BigDecimal maxPrice;

  @Positive private Integer diners;

  @NotNull private MenuSort sort = MenuSort.LATEST;

  @Min(1)
  private int page = 1;

  @Min(1)
  @Max(100)
  private int size = 12;

  @AssertTrue(message = "minPrice must be less than or equal to maxPrice")
  public boolean isPriceRangeValid() {
    return minPrice == null || maxPrice == null || minPrice.compareTo(maxPrice) <= 0;
  }
}
