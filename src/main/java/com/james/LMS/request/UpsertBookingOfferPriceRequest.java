package com.james.LMS.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class UpsertBookingOfferPriceRequest {
  @NotNull(message = "Total amount is required")
  @Positive(message = "Total amount must be positive")
  private BigDecimal totalAmount;

  @NotNull(message = "Booking ID is required")
  private Long bookingId;

  @NotNull(message = "Conversation ID is required")
  private Long chatConversationId;

  private String message;
}
