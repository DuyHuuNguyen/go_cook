package com.james.LMS.service.impl;

import com.james.LMS.repository.BookingRequestRepository;
import com.james.LMS.service.BookingRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingRequestServiceImpl implements BookingRequestService {
  private final BookingRequestRepository bookingRequestRepository;
}
