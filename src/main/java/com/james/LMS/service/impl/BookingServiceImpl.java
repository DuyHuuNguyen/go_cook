package com.james.LMS.service.impl;

import com.james.LMS.repository.BookingRepository;
import com.james.LMS.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {
  private final BookingRepository bookingRepository;
}
