package com.james.LMS.facade;

import com.james.LMS.request.ChatMessageRequest;
import com.james.LMS.request.UpsertBookingOfferPriceRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.BookingPriceOfferResponse;
import com.james.LMS.response.ChatConversationResponse;
import com.james.LMS.response.ChatMessageResponse;
import com.james.LMS.response.KeySetPaginationResponse;
import java.util.List;

public interface ConversationFacade {
  BaseResponse<Void> createConversation(Long guestId);

  BaseResponse<BookingPriceOfferResponse> createBookingOfferPrice(
      UpsertBookingOfferPriceRequest request);

  BaseResponse<BookingPriceOfferResponse> acceptBookingOfferPrice(Long bookingPriceOfferId);

  BaseResponse<BookingPriceOfferResponse> rejectBookingOfferPrice(Long bookingPriceOfferId);

  BaseResponse<List<BookingPriceOfferResponse>> getConversationOffers(Long conversationId);

  BaseResponse<ChatMessageResponse> sendMessage(ChatMessageRequest request);

  BaseResponse<KeySetPaginationResponse<ChatConversationResponse>> getConversations(Long lastId);

  BaseResponse<ChatConversationResponse> getOrCreateConversationForBooking(Long bookingId);

  BaseResponse<List<ChatMessageResponse>> getConversationMessages(Long conversationId);

  BaseResponse<ChatConversationResponse> markConversationAsRead(Long conversationId);

  BaseResponse<Long> getUnreadMessageCount();

  BaseResponse<List<ChatMessageResponse>> getUnreadMessages();

  BaseResponse<ChatMessageResponse> markMessageAsRead(Long messageId);

  BaseResponse<Void> markAllMessagesAsRead();
}
