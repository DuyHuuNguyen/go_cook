package com.james.LMS.service.impl;

import com.james.LMS.repository.BookingPriceOfferRepository;
import com.james.LMS.service.BookingPriceOfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingPriceOfferServiceImpl implements BookingPriceOfferService {
  private final BookingPriceOfferRepository bookingPriceOfferRepository;
}
