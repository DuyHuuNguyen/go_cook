package com.james.LMS.facade;

import com.james.LMS.request.BookingSearchRequest;
import com.james.LMS.request.CreateBookingRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.BookingResponse;
import com.james.LMS.response.PaginationResponse;

public interface BookingFacade {
  BaseResponse<BookingResponse> createBooking(CreateBookingRequest request);

  BaseResponse<PaginationResponse<BookingResponse>> findBookings(BookingSearchRequest request);
}
