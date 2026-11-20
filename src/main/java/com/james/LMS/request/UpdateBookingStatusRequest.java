package com.james.LMS.request;

import com.james.LMS.enums.BookingStatus;
import io.swagger.v3.oas.annotations.Hidden;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Getter
public class UpdateBookingStatusRequest {
  @Hidden @Positive private Long id;

  @NotBlank private BookingStatus status;

  public void withId(Long id) {
    this.id = id;
  }
}
