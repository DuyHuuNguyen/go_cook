package com.james.LMS.facade;

import com.james.LMS.request.ChatMessageRequest;
import com.james.LMS.request.UpsertBookingOfferPriceRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.BookingPriceOfferResponse;
import com.james.LMS.response.ChatConversationResponse;
import com.james.LMS.response.ChatMessageResponse;
import java.util.List;

public interface ConversationFacade {
  BaseResponse<Void> createConversation(Long guestId);

  BaseResponse<BookingPriceOfferResponse> createBookingOfferPrice(
      UpsertBookingOfferPriceRequest request);

  BaseResponse<BookingPriceOfferResponse> acceptBookingOfferPrice(Long bookingPriceOfferId);

  BaseResponse<BookingPriceOfferResponse> rejectBookingOfferPrice(Long bookingPriceOfferId);

  BaseResponse<ChatMessageResponse> sendMessage(ChatMessageRequest request);

  BaseResponse<List<ChatConversationResponse>> getConversations();

  BaseResponse<List<ChatMessageResponse>> getConversationMessages(Long conversationId);
}
