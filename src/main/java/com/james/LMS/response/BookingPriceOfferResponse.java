package com.james.LMS.response;

import com.james.LMS.enums.BookingPriceOfferStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingPriceOfferResponse {
  private Long id;
  private Long bookingId;
  private Long senderId;
  private Double totalAmount;
  private BookingPriceOfferStatus status;
  private String message;
  private Long createdAt;
}
