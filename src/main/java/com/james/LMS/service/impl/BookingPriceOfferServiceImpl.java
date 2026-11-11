package com.james.LMS.service.impl;

import com.james.LMS.entity.BookingPriceOffer;
import com.james.LMS.enums.BookingPriceOfferStatus;
import com.james.LMS.repository.BookingPriceOfferRepository;
import com.james.LMS.service.BookingPriceOfferService;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingPriceOfferServiceImpl implements BookingPriceOfferService {
  private final BookingPriceOfferRepository bookingPriceOfferRepository;

  @Override
  public BookingPriceOffer save(BookingPriceOffer bookingPriceOffer) {
    return bookingPriceOfferRepository.save(bookingPriceOffer);
  }

  @Override
  public Optional<BookingPriceOffer> findById(Long id) {
    return bookingPriceOfferRepository.findById(id);
  }

  @Override
  public Optional<BookingPriceOffer> findLatestAcceptedByConversationId(Long conversationId) {
    return bookingPriceOfferRepository.findLatestByConversationIdAndStatus(
        conversationId, BookingPriceOfferStatus.ACCEPTED);
  }

  @Override
  public List<BookingPriceOffer> findByConversationId(Long conversationId) {
    return bookingPriceOfferRepository.findByConversationIdOrderByIdAsc(conversationId);
  }
}
