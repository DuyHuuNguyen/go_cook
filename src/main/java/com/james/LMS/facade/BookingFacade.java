package com.james.LMS.facade;

import com.james.LMS.request.BookingSearchRequest;
import com.james.LMS.request.CreateBookingChefRequest;
import com.james.LMS.request.CreateBookingRequest;
import com.james.LMS.request.UpdateBookingStatusRequest;
import com.james.LMS.response.*;

public interface BookingFacade {
  BaseResponse<BookingResponse> createBooking(CreateBookingRequest request);

  BaseResponse<PaginationResponse<BookingResponse>> findBookings(BookingSearchRequest request);

  MatchingChefsResponse findMatchingChefs(Long bookingId);

  BaseResponse<BookingChefRequestResponse> requestChef(
      Long bookingId, CreateBookingChefRequest request);

  BaseResponse<KeySetPaginationResponse<BookingResponse>> findBookingByChef(Long lastId);

  BaseResponse<Void> updateBookingStatus(UpdateBookingStatusRequest request);
}
