package com.james.LMS.service.impl;

import com.james.LMS.enums.BookingRequestStatus;
import com.james.LMS.repository.BookingRequestRepository;
import com.james.LMS.service.BookingRequestService;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingRequestExpirationJob {
  private final BookingRequestRepository requests;
  private final BookingRequestService bookingRequestService;

  @Scheduled(fixedDelayString = "${booking.chef.expiry-scan-delay-ms:60000}")
  public void expireDueRequests() {
    List<Long> ids =
        requests.findDueIds(
            List.of(
                BookingRequestStatus.PENDING,
                BookingRequestStatus.ACCEPTED,
                BookingRequestStatus.AWAITING_PAYMENT),
            Instant.now(),
            PageRequest.of(0, 100));
    for (Long id : ids) {
      try {
        bookingRequestService.expireDueRequest(id);
      } catch (RuntimeException exception) {
        log.error("Failed to expire booking request {}", id, exception);
      }
    }
  }
}
