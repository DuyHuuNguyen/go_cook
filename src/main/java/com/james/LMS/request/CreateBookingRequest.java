package com.james.LMS.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateBookingRequest {
  @NotNull @Future private Instant scheduledAt;

  @NotBlank
  @Size(max = 500)
  private String serviceAddress;

  @Size(max = 500)
  private String customerNote;

  @NotNull @Positive private Integer guestCount;

  @NotEmpty @Valid private List<BookingDishRequest> dishes;
}
