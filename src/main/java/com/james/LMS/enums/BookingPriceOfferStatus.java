package com.james.LMS.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum BookingPriceOfferStatus {
  PENDING("Pending"),
  ACCEPTED("Accepted"),
  REJECTED("Rejected"),
  EXPIRED("Expired");

  private final String label;

  public String getValue() {
    return name();
  }
}
