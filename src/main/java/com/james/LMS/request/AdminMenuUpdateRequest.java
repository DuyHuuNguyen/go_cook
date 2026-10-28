package com.james.LMS.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record AdminMenuUpdateRequest(
        @NotBlank @Size(max = 255) String name,
        @Size(max = 3000) String description,
        @NotNull @Positive Long categoryId,
        @NotNull @DecimalMin("0.0") BigDecimal tempPrice,
        @NotNull @Min(1) Integer minGuests,
        @NotNull @Min(1) Integer maxGuests) {

    @AssertTrue(message = "Khách tối đa phải lớn hơn hoặc bằng khách tối thiểu.")
    public boolean isGuestRangeValid() {
        return minGuests == null || maxGuests == null || maxGuests >= minGuests;
    }
}
