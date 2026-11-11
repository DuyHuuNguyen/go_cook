package com.james.LMS.service;

import com.james.LMS.entity.BookingPriceOffer;
import java.util.Optional;

public interface BookingPriceOfferService {
  BookingPriceOffer save(BookingPriceOffer bookingPriceOffer);

  Optional<BookingPriceOffer> findById(Long id);

  Optional<BookingPriceOffer> findLatestAcceptedByConversationId(Long conversationId);
}
