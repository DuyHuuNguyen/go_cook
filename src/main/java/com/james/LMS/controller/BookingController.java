package com.james.LMS.controller;

import com.james.LMS.config.SecurityConfig;
import com.james.LMS.facade.BookingFacade;
import com.james.LMS.request.BookingSearchRequest;
import com.james.LMS.request.CreateBookingChefRequest;
import com.james.LMS.request.CreateBookingRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.BookingChefRequestResponse;
import com.james.LMS.response.BookingDetailResponse;
import com.james.LMS.response.BookingResponse;
import com.james.LMS.response.MatchingChefsResponse;
import com.james.LMS.response.PaginationResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {
  private final BookingFacade bookingFacade;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(
      summary = "Create a booking with selected dishes",
      description = "Dish prices remain provisional until a chef sends a price offer.",
      tags = {"Booking APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasAnyRole('USER', 'SYSTEM_ADMIN')")
  public BaseResponse<BookingResponse> createBooking(
      @Valid @RequestBody CreateBookingRequest request) {
    return bookingFacade.createBooking(request);
  }

  @GetMapping
  @Operation(
      summary = "List the authenticated customer's bookings",
      description = "Page is one-based; size must be between 1 and 100.",
      tags = {"Booking APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasAnyRole('USER', 'SYSTEM_ADMIN')")
  public BaseResponse<PaginationResponse<BookingResponse>> findBookings(
      @Valid @ParameterObject BookingSearchRequest request) {
    return bookingFacade.findBookings(request);
  }

  @GetMapping("/{bookingId}")
  @Operation(
      summary = "Get booking details for checkout",
      tags = {"Booking APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasAnyRole('USER', 'SYSTEM_ADMIN')")
  public BaseResponse<BookingDetailResponse> findBookingDetails(@PathVariable Long bookingId) {
    return bookingFacade.findBookingDetails(bookingId);
  }

  @GetMapping("/{bookingId}/matching-chefs")
  @Operation(
      summary = "Find available chefs matching a customer's booking",
      tags = {"Booking APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasAnyRole('USER', 'SYSTEM_ADMIN')")
  public MatchingChefsResponse findMatchingChefs(@PathVariable Long bookingId) {
    return bookingFacade.findMatchingChefs(bookingId);
  }

  @PostMapping("/{bookingId}/requests")
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(
      summary = "Request a chef for a booking",
      tags = {"Booking APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("hasAnyRole('USER', 'SYSTEM_ADMIN')")
  public BaseResponse<BookingChefRequestResponse> requestChef(
      @PathVariable Long bookingId, @Valid @RequestBody CreateBookingChefRequest request) {
    return bookingFacade.requestChef(bookingId, request);
  }
}
