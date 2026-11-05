package com.james.LMS.facade;

import com.james.LMS.request.BookingSearchRequest;
import com.james.LMS.request.CreateBookingRequest;
import com.james.LMS.request.CreateBookingChefRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.BookingResponse;
import com.james.LMS.response.BookingChefRequestResponse;
import com.james.LMS.response.MatchingChefsResponse;
import com.james.LMS.response.PaginationResponse;

public interface BookingFacade {
  BaseResponse<BookingResponse> createBooking(CreateBookingRequest request);

  BaseResponse<PaginationResponse<BookingResponse>> findBookings(BookingSearchRequest request);

  MatchingChefsResponse findMatchingChefs(Long bookingId);

  BaseResponse<BookingChefRequestResponse> requestChef(
      Long bookingId, CreateBookingChefRequest request);
}
