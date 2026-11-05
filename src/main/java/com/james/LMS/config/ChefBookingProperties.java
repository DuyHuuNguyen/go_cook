package com.james.LMS.config;

import com.james.LMS.enums.BookingRequestStatus;
import java.time.Duration;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "booking.chef")
@Getter
@Setter
public class ChefBookingProperties {
  private Duration preparationDuration = Duration.ofHours(2);
  private Duration responseHold = Duration.ofMinutes(30);
  private Duration negotiationHold = Duration.ofHours(2);
  private Duration paymentHold = Duration.ofMinutes(30);

  public Duration holdFor(BookingRequestStatus status) {
    return switch (status) {
      case PENDING -> responseHold;
      case ACCEPTED -> negotiationHold;
      case AWAITING_PAYMENT -> paymentHold;
      default -> throw new IllegalArgumentException("Request status has no hold duration: " + status);
    };
  }
}
