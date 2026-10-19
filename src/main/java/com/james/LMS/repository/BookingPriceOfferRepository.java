package com.james.LMS.repository;

import com.james.LMS.entity.BookingPriceOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingPriceOfferRepository extends JpaRepository<BookingPriceOffer, Long> {}
