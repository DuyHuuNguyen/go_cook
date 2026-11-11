package com.james.LMS.repository;

import com.james.LMS.entity.BookingPriceOffer;
import com.james.LMS.enums.BookingPriceOfferStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingPriceOfferRepository extends JpaRepository<BookingPriceOffer, Long> {
  @Query(
      "SELECT bpo FROM BookingPriceOffer bpo WHERE bpo.conversation.id = :conversationId AND bpo.status = :status ORDER BY bpo.id DESC LIMIT 1")
  Optional<BookingPriceOffer> findLatestByConversationIdAndStatus(
      @Param("conversationId") Long conversationId,
      @Param("status") BookingPriceOfferStatus status);

  List<BookingPriceOffer> findByConversationIdOrderByIdAsc(Long conversationId);
}
