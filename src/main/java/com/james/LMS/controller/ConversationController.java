package com.james.LMS.controller;

import com.james.LMS.config.SecurityConfig;
import com.james.LMS.facade.ConversationFacade;
import com.james.LMS.request.UpsertBookingOfferPriceRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.BookingPriceOfferResponse;
import com.james.LMS.response.ChatConversationResponse;
import com.james.LMS.response.ChatMessageResponse;
import com.james.LMS.response.KeySetPaginationResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/v1/conversations")
@RestController
@RequiredArgsConstructor
public class ConversationController {

  private final ConversationFacade conversationFacade;

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  @Operation(
      summary = "Get conversations for current user with keyset pagination",
      tags = {"Conversation APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("isAuthenticated()")
  public BaseResponse<KeySetPaginationResponse<ChatConversationResponse>> getConversations(
      @RequestParam(value = "lastId", required = false, defaultValue = "0") Long lastId) {
    return conversationFacade.getConversations(lastId);
  }

  @GetMapping("/unread-count")
  @ResponseStatus(HttpStatus.OK)
  @Operation(
      summary = "Get total unread message count for current user",
      tags = {"Conversation APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("isAuthenticated()")
  public BaseResponse<Long> getUnreadMessageCount() {
    return conversationFacade.getUnreadMessageCount();
  }

  @PatchMapping("/{conversationId}/read")
  @ResponseStatus(HttpStatus.OK)
  @Operation(
      summary = "Mark all incoming messages in a conversation as read",
      tags = {"Conversation APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("isAuthenticated()")
  public BaseResponse<ChatConversationResponse> markConversationAsRead(
      @PathVariable Long conversationId) {
    return conversationFacade.markConversationAsRead(conversationId);
  }

  @GetMapping("/{conversationId}/messages")
  @ResponseStatus(HttpStatus.OK)
  @Operation(
      summary = "Get all messages in a conversation",
      tags = {"Conversation APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("isAuthenticated()")
  public BaseResponse<List<ChatMessageResponse>> getConversationMessages(
      @PathVariable Long conversationId) {
    return conversationFacade.getConversationMessages(conversationId);
  }

  @GetMapping("/booking/{bookingId}")
  @ResponseStatus(HttpStatus.OK)
  @Operation(
      summary = "Get or create conversation strictly for a booking between its customer and chef",
      tags = {"Conversation APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("isAuthenticated()")
  public BaseResponse<ChatConversationResponse> getOrCreateConversationForBooking(
      @PathVariable Long bookingId) {
    return conversationFacade.getOrCreateConversationForBooking(bookingId);
  }

  @PostMapping("/{guestId}")
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(
      summary = "Create conversation between current user and guest",
      tags = {"Conversation APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("isAuthenticated()")
  public BaseResponse<Void> createConversation(@PathVariable Long guestId) {
    return conversationFacade.createConversation(guestId);
  }

  @GetMapping("/{conversationId}/offers")
  @ResponseStatus(HttpStatus.OK)
  @Operation(
      summary = "Get all price offers in a conversation",
      tags = {"Conversation APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("isAuthenticated()")
  public BaseResponse<List<BookingPriceOfferResponse>> getConversationOffers(
      @PathVariable Long conversationId) {
    return conversationFacade.getConversationOffers(conversationId);
  }

  @PostMapping("/offers")
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(
      summary = "Create booking offer price in conversation",
      tags = {"Conversation APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("isAuthenticated()")
  public BaseResponse<BookingPriceOfferResponse> createBookingOfferPrice(
      @Valid @RequestBody UpsertBookingOfferPriceRequest request) {
    return conversationFacade.createBookingOfferPrice(request);
  }

  @PatchMapping("/offers/{offerId}/accept")
  @ResponseStatus(HttpStatus.OK)
  @Operation(
      summary = "Accept booking offer price (receiver only)",
      tags = {"Conversation APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("isAuthenticated()")
  public BaseResponse<BookingPriceOfferResponse> acceptBookingOfferPrice(
      @PathVariable Long offerId) {
    return conversationFacade.acceptBookingOfferPrice(offerId);
  }

  @PatchMapping("/offers/{offerId}/reject")
  @ResponseStatus(HttpStatus.OK)
  @Operation(
      summary = "Reject booking offer price (receiver only)",
      tags = {"Conversation APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("isAuthenticated()")
  public BaseResponse<BookingPriceOfferResponse> rejectBookingOfferPrice(
      @PathVariable Long offerId) {
    return conversationFacade.rejectBookingOfferPrice(offerId);
  }
}
