package com.james.LMS.facade.impl;

import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.entity.Booking;
import com.james.LMS.enums.ErrorCode;
import com.james.LMS.exception.EntityNotFoundException;
import com.james.LMS.facade.BookingFacade;
import com.james.LMS.request.BookingSearchRequest;
import com.james.LMS.request.CreateBookingChefRequest;
import com.james.LMS.request.CreateBookingRequest;
import com.james.LMS.request.UpdateBookingStatusRequest;
import com.james.LMS.response.*;
import com.james.LMS.service.BookingRequestService;
import com.james.LMS.service.BookingService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingFacadeImpl implements BookingFacade {
  private final BookingService bookingService;
  private final BookingRequestService bookingRequestService;

  @Override
  @Transactional
  public BaseResponse<BookingResponse> createBooking(CreateBookingRequest request) {
    Long customerId = SecurityUserDetails.getPrincipal().getId();
    BookingResponse response =
        BookingResponse.from(bookingService.createBooking(request, customerId));
    return BaseResponse.build(response, true);
  }

  @Override
  @Transactional(readOnly = true)
  public BaseResponse<PaginationResponse<BookingResponse>> findBookings(
      BookingSearchRequest request) {
    Long customerId = SecurityUserDetails.getPrincipal().getId();
    var page =
        bookingService
            .findCustomerBookings(
                customerId,
                PageRequest.of(
                    request.getPage() - 1,
                    request.getSize(),
                    Sort.by(Sort.Direction.DESC, "createdAt")
                        .and(Sort.by(Sort.Direction.DESC, "id"))))
            .map(BookingResponse::from);
    return BaseResponse.build(PaginationResponse.from(page), true);
  }

  @Override
  @Transactional(readOnly = true)
  public MatchingChefsResponse findMatchingChefs(Long bookingId) {
    Long customerId = SecurityUserDetails.getPrincipal().getId();
    return new MatchingChefsResponse(true, bookingService.findMatchingChefs(bookingId, customerId));
  }

  @Override
  public BaseResponse<BookingChefRequestResponse> requestChef(
      Long bookingId, CreateBookingChefRequest request) {
    Long customerId = SecurityUserDetails.getPrincipal().getId();
    return BaseResponse.build(
        bookingRequestService.create(bookingId, request.chefId(), customerId), true);
  }

  @Override
  @Transactional(readOnly = true)
  public BaseResponse<KeySetPaginationResponse<BookingResponse>> findBookingByChef(Long lastId) {
    SecurityUserDetails principal = SecurityUserDetails.getPrincipal();

    List<BookingResponse> bookingResponses =
        this.bookingService.findByLastIdAndChefIdOrderByIdDesc(lastId, principal.getId()).stream()
            .map(BookingResponse::from)
            .toList();

    boolean hasNext = !bookingResponses.isEmpty();
    lastId = hasNext ? bookingResponses.getLast().id() : -1L;

    var paginationResponse =
        KeySetPaginationResponse.<BookingResponse>builder()
            .data(bookingResponses)
            .lastId(lastId)
            .hasNext(hasNext)
            .build();
    return BaseResponse.build(paginationResponse, true);
  }

  @Override
  @Transactional
  public BaseResponse<Void> updateBookingStatus(UpdateBookingStatusRequest request) {
    SecurityUserDetails principal = SecurityUserDetails.getPrincipal();

    Booking booking =
        this.bookingService
            .findBookingByIdAndChefIdAndIsActiveTrue(request.getId(), principal.getId())
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.BOOKING_NOT_FOUND));

    booking.changeStatus(request.getStatus());

    bookingService.save(booking);

    return BaseResponse.ok();
  }
}
