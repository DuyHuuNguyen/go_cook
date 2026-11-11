package com.james.LMS.facade.impl;

import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.entity.Booking;
import com.james.LMS.entity.BookingPriceOffer;
import com.james.LMS.entity.ChatConversation;
import com.james.LMS.entity.ChatMessage;
import com.james.LMS.entity.ChatMessageAttachment;
import com.james.LMS.entity.User;
import com.james.LMS.enums.BookingPriceOfferStatus;
import com.james.LMS.enums.ErrorCode;
import com.james.LMS.enums.RoleEnum;
import com.james.LMS.exception.EntityNotFoundException;
import com.james.LMS.exception.ForbiddenException;
import com.james.LMS.facade.ConversationFacade;
import com.james.LMS.request.ChatMessageRequest;
import com.james.LMS.request.UpsertBookingOfferPriceRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.BookingPriceOfferResponse;
import com.james.LMS.response.ChatConversationResponse;
import com.james.LMS.response.ChatMessageResponse;
import com.james.LMS.service.BookingPriceOfferService;
import com.james.LMS.service.BookingService;
import com.james.LMS.service.ChatConversationService;
import com.james.LMS.service.ChatMessageAttachmentService;
import com.james.LMS.service.ChatMessageService;
import com.james.LMS.service.UserService;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConversationFacadeImpl implements ConversationFacade {
  private final ChatConversationService chatConversationService;
  private final UserService userService;
  private final BookingService bookingService;
  private final BookingPriceOfferService bookingPriceOfferService;
  private final ChatMessageService chatMessageService;
  private final ChatMessageAttachmentService chatMessageAttachmentService;
  private final SimpMessagingTemplate messagingTemplate;

  @Override
  @Transactional
  public BaseResponse<Void> createConversation(Long guestId) {
    SecurityUserDetails principal = SecurityUserDetails.getPrincipal();
    Long currentUserId = principal.getId();

    User currentUser =
        userService
            .findUserAndFetchRolesById(currentUserId)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));
    User guest =
        userService
            .findUserAndFetchRolesById(guestId)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));

    boolean currentIsChef = principal.isChef();
    boolean guestIsChef =
        guest.getRoles().stream().anyMatch(role -> role.getRoleName() == RoleEnum.ROLE_CHEF);

    User chef;
    User customer;

    if (currentIsChef && guestIsChef) {
      chef = currentUser;
      customer = guest;
    } else if (currentIsChef) {
      chef = currentUser;
      customer = guest;
    } else if (guestIsChef) {
      chef = guest;
      customer = currentUser;
    } else {
      customer = currentUser;
      chef = guest;
    }

    ChatConversation chatConversation =
        ChatConversation.builder()
            .customer(customer)
            .chef(chef)
            .lastMessageAt(System.currentTimeMillis())
            .build();

    chatConversationService.save(chatConversation);

    return BaseResponse.ok();
  }

  @Override
  @Transactional
  public BaseResponse<BookingPriceOfferResponse> createBookingOfferPrice(
      UpsertBookingOfferPriceRequest request) {
    SecurityUserDetails principal = SecurityUserDetails.getPrincipal();
    Long currentUserId = principal.getId();

    ChatConversation conversation =
        chatConversationService
            .findById(request.getChatConversationId())
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.CONVERSATION_NOT_FOUND));

    Long customerId = conversation.getCustomer().getId();
    Long chefId = conversation.getChef().getId();
    boolean isParticipant = currentUserId.equals(customerId) || currentUserId.equals(chefId);

    if (!isParticipant) {
      throw new ForbiddenException(ErrorCode.CONVERSATION_ACCESS_DENIED);
    }

    Booking booking =
        bookingService
            .findById(request.getBookingId())
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.BOOKING_NOT_FOUND));

    Long bookingCustomerId = booking.getCustomer().getId();
    Long bookingChefId = booking.getChef() != null ? booking.getChef().getId() : null;

    boolean bookingBelongsToConversation =
        bookingCustomerId.equals(customerId)
            && (bookingChefId == null || bookingChefId.equals(chefId));

    if (!bookingBelongsToConversation) {
      throw new ForbiddenException(ErrorCode.BOOKING_CONVERSATION_MISMATCH);
    }

    User sender =
        userService
            .findById(currentUserId)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));

    BookingPriceOffer offer =
        BookingPriceOffer.builder()
            .totalAmount(request.getTotalAmount())
            .message(request.getMessage())
            .conversation(conversation)
            .sender(sender)
            .booking(booking)
            .build();

    BookingPriceOffer savedOffer = bookingPriceOfferService.save(offer);

    BookingPriceOfferResponse response =
        BookingPriceOfferResponse.builder()
            .id(savedOffer.getId())
            .bookingId(booking.getId())
            .senderId(sender.getId())
            .totalAmount(savedOffer.getTotalAmount().doubleValue())
            .status(savedOffer.getStatus())
            .message(savedOffer.getMessage())
            .createdAt(savedOffer.getCreatedAt())
            .build();

    // Broadcast price offer to WebSocket
    messagingTemplate.convertAndSend("/topic/offers/" + conversation.getId(), response);

    return BaseResponse.build(response, true);
  }

  @Override
  @Transactional
  public BaseResponse<BookingPriceOfferResponse> acceptBookingOfferPrice(Long bookingPriceOfferId) {
    SecurityUserDetails principal = SecurityUserDetails.getPrincipal();
    Long currentUserId = principal.getId();

    BookingPriceOffer offer =
        bookingPriceOfferService
            .findById(bookingPriceOfferId)
            .orElseThrow(
                () -> new EntityNotFoundException(ErrorCode.BOOKING_PRICE_OFFER_NOT_FOUND));

    if (offer.getStatus() != BookingPriceOfferStatus.PENDING) {
      throw new ForbiddenException(ErrorCode.OFFER_ALREADY_PROCESSED);
    }

    ChatConversation conversation = offer.getConversation();
    Long senderId = offer.getSender().getId();
    Long customerId = conversation.getCustomer().getId();
    Long chefId = conversation.getChef().getId();

    Long receiverId = senderId.equals(customerId) ? chefId : customerId;

    if (!currentUserId.equals(receiverId)) {
      throw new ForbiddenException(ErrorCode.ONLY_RECEIVER_CAN_ACCEPT_OFFER);
    }

    offer.setStatus(BookingPriceOfferStatus.ACCEPTED);
    BookingPriceOffer savedOffer = bookingPriceOfferService.save(offer);

    BookingPriceOfferResponse response =
        BookingPriceOfferResponse.builder()
            .id(savedOffer.getId())
            .bookingId(savedOffer.getBooking().getId())
            .senderId(savedOffer.getSender().getId())
            .totalAmount(savedOffer.getTotalAmount().doubleValue())
            .status(savedOffer.getStatus())
            .message(savedOffer.getMessage())
            .createdAt(savedOffer.getCreatedAt())
            .build();

    // Broadcast acceptance to WebSocket
    messagingTemplate.convertAndSend("/topic/offers/" + conversation.getId(), response);

    return BaseResponse.build(response, true);
  }

  @Override
  @Transactional
  public BaseResponse<BookingPriceOfferResponse> rejectBookingOfferPrice(Long bookingPriceOfferId) {
    SecurityUserDetails principal = SecurityUserDetails.getPrincipal();
    Long currentUserId = principal.getId();

    BookingPriceOffer offer =
        bookingPriceOfferService
            .findById(bookingPriceOfferId)
            .orElseThrow(
                () -> new EntityNotFoundException(ErrorCode.BOOKING_PRICE_OFFER_NOT_FOUND));

    if (offer.getStatus() != BookingPriceOfferStatus.PENDING) {
      throw new ForbiddenException(ErrorCode.OFFER_ALREADY_PROCESSED);
    }

    ChatConversation conversation = offer.getConversation();
    Long senderId = offer.getSender().getId();
    Long customerId = conversation.getCustomer().getId();
    Long chefId = conversation.getChef().getId();

    Long receiverId = senderId.equals(customerId) ? chefId : customerId;

    if (!currentUserId.equals(receiverId)) {
      throw new ForbiddenException(ErrorCode.ONLY_RECEIVER_CAN_REJECT_OFFER);
    }

    offer.setStatus(BookingPriceOfferStatus.REJECTED);
    BookingPriceOffer savedOffer = bookingPriceOfferService.save(offer);

    BookingPriceOfferResponse response =
        BookingPriceOfferResponse.builder()
            .id(savedOffer.getId())
            .bookingId(savedOffer.getBooking().getId())
            .senderId(savedOffer.getSender().getId())
            .totalAmount(savedOffer.getTotalAmount().doubleValue())
            .status(savedOffer.getStatus())
            .message(savedOffer.getMessage())
            .createdAt(savedOffer.getCreatedAt())
            .build();

    // Broadcast rejection to WebSocket
    messagingTemplate.convertAndSend("/topic/offers/" + conversation.getId(), response);

    return BaseResponse.build(response, true);
  }

  @Override
  @Transactional
  public BaseResponse<ChatMessageResponse> sendMessage(ChatMessageRequest request) {
    SecurityUserDetails principal = SecurityUserDetails.getPrincipal();
    Long currentUserId = principal.getId();

    // Validate conversation exists
    ChatConversation conversation =
        chatConversationService
            .findById(request.getConversationId())
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.CONVERSATION_NOT_FOUND));

    // Access control: user must be participant in conversation
    Long customerId = conversation.getCustomer().getId();
    Long chefId = conversation.getChef().getId();
    boolean isParticipant = currentUserId.equals(customerId) || currentUserId.equals(chefId);

    if (!isParticipant) {
      throw new ForbiddenException(ErrorCode.CONVERSATION_ACCESS_DENIED);
    }

    // Get sender
    User sender =
        userService
            .findById(currentUserId)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));

    // Validate reply-to message if provided
    ChatMessage replyToMessage = null;
    if (request.getReplyToMessageId() != null) {
      replyToMessage =
          chatMessageService
              .findById(request.getReplyToMessageId())
              .orElseThrow(() -> new EntityNotFoundException(ErrorCode.MESSAGE_NOT_FOUND));
    }

    // Create message
    ChatMessage message =
        ChatMessage.builder()
            .conversation(conversation)
            .sender(sender)
            .messageType(request.getMessageType())
            .content(request.getContent())
            .replyToMessage(replyToMessage)
            .build();

    ChatMessage savedMessage = chatMessageService.save(message);

    // Create attachments if provided
    List<ChatMessageAttachment> attachments = new ArrayList<>();
    if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
      for (ChatMessageRequest.AttachmentRequest attachmentReq : request.getAttachments()) {
        ChatMessageAttachment attachment =
            ChatMessageAttachment.builder()
                .message(savedMessage)
                .fileUrl(attachmentReq.getFileUrl())
                .fileName(attachmentReq.getFileName())
                .fileType(attachmentReq.getFileType())
                .fileSize(attachmentReq.getFileSize())
                .build();
        attachments.add(attachment);
      }
      attachments = chatMessageAttachmentService.saveAll(attachments);
    }

    // Update conversation last message timestamp
    conversation.setLastMessageAt(System.currentTimeMillis());
    chatConversationService.save(conversation);

    // Build response
    List<ChatMessageResponse.AttachmentResponse> attachmentResponses =
        attachments.stream()
            .map(
                att ->
                    ChatMessageResponse.AttachmentResponse.builder()
                        .id(att.getId())
                        .fileUrl(att.getFileUrl())
                        .fileName(att.getFileName())
                        .fileType(att.getFileType())
                        .fileSize(att.getFileSize())
                        .build())
            .toList();

    ChatMessageResponse response =
        ChatMessageResponse.builder()
            .id(savedMessage.getId())
            .conversationId(conversation.getId())
            .senderId(sender.getId())
            .senderName(sender.getUsername())
            .messageType(savedMessage.getMessageType())
            .content(savedMessage.getContent())
            .sentAt(savedMessage.getCreatedAt())
            .read(savedMessage.isRead())
            .readAt(savedMessage.getReadAt())
            .replyToMessageId(replyToMessage != null ? replyToMessage.getId() : null)
            .attachments(attachmentResponses)
            .build();

    // Broadcast to WebSocket subscribers
    messagingTemplate.convertAndSend("/topic/messages", response);

    return BaseResponse.build(response, true);
  }

  @Override
  @Transactional(readOnly = true)
  public BaseResponse<List<ChatConversationResponse>> getConversations() {
    SecurityUserDetails principal = SecurityUserDetails.getPrincipal();
    Long currentUserId = principal.getId();

    List<ChatConversation> conversations = chatConversationService.findByUserId(currentUserId);

    List<ChatConversationResponse> responses =
        conversations.stream().map(this::mapToResponse).toList();

    return BaseResponse.build(responses, true);
  }

  @Override
  @Transactional
  public BaseResponse<ChatConversationResponse> getOrCreateConversationForBooking(Long bookingId) {
    SecurityUserDetails principal = SecurityUserDetails.getPrincipal();
    Long currentUserId = principal.getId();

    Booking booking =
        bookingService
            .findById(bookingId)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.BOOKING_NOT_FOUND));

    Long customerId = booking.getCustomer().getId();
    Long chefId = booking.getChef() != null ? booking.getChef().getId() : null;

    if (chefId == null) {
      throw new ForbiddenException(ErrorCode.CHEF_PROFILE_NOT_FOUND);
    }

    boolean isParticipant = currentUserId.equals(customerId) || currentUserId.equals(chefId);
    if (!isParticipant) {
      throw new ForbiddenException(ErrorCode.CONVERSATION_ACCESS_DENIED);
    }

    // 1. Try finding conversation already linked to this booking
    Optional<ChatConversation> existingByBooking =
        chatConversationService.findByBookingId(bookingId);
    ChatConversation conversation;

    if (existingByBooking.isPresent()) {
      conversation = existingByBooking.get();
    } else {
      // 2. Check if there is an existing conversation between customer and chef
      List<ChatConversation> existingPair =
          chatConversationService.findByCustomerIdAndChefId(customerId, chefId);
      if (!existingPair.isEmpty()) {
        conversation = existingPair.get(0);
        if (conversation.getBooking() == null) {
          conversation.setBooking(booking);
          conversation = chatConversationService.save(conversation);
        }
      } else {
        // 3. Create new conversation strictly between this customer and this chef for this booking
        ChatConversation newConv =
            ChatConversation.builder()
                .customer(booking.getCustomer())
                .chef(booking.getChef())
                .booking(booking)
                .status(com.james.LMS.entity.ChatConversationStatus.ACTIVE)
                .lastMessageAt(System.currentTimeMillis())
                .build();
        conversation = chatConversationService.save(newConv);
      }
    }

    ChatConversationResponse response = mapToResponse(conversation);
    return BaseResponse.build(response, true);
  }

  private ChatConversationResponse mapToResponse(ChatConversation conv) {
    ChatConversationResponse.BookingInfo bookingInfo = null;
    if (conv.getBooking() != null) {
      Booking booking = conv.getBooking();
      BigDecimal displayAmount = booking.getTotalAmount();

      // Override with latest accepted offer price if exists
      Optional<BookingPriceOffer> latestAccepted =
          bookingPriceOfferService.findLatestAcceptedByConversationId(conv.getId());
      if (latestAccepted.isPresent()) {
        displayAmount = latestAccepted.get().getTotalAmount();
      }

      bookingInfo =
          ChatConversationResponse.BookingInfo.builder()
              .id(booking.getId())
              .bookingCode(booking.getBookingCode())
              .totalAmount(displayAmount)
              .build();
    }

    return ChatConversationResponse.builder()
        .id(conv.getId())
        .booking(bookingInfo)
        .customer(
            ChatConversationResponse.UserInfo.builder()
                .id(conv.getCustomer().getId())
                .name(conv.getCustomer().getUsername())
                .avatar(conv.getCustomer().getAvatarUrl())
                .build())
        .chef(
            ChatConversationResponse.UserInfo.builder()
                .id(conv.getChef().getId())
                .name(conv.getChef().getUsername())
                .avatar(conv.getChef().getAvatarUrl())
                .build())
        .status(conv.getStatus())
        .lastMessageAt(conv.getLastMessageAt())
        .unreadCount(0) // ponytail: calculate unread count from messages
        .build();
  }

  @Override
  @Transactional(readOnly = true)
  public BaseResponse<List<ChatMessageResponse>> getConversationMessages(Long conversationId) {
    SecurityUserDetails principal = SecurityUserDetails.getPrincipal();
    Long currentUserId = principal.getId();

    ChatConversation conversation =
        chatConversationService
            .findById(conversationId)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.CONVERSATION_NOT_FOUND));

    // Access control
    Long customerId = conversation.getCustomer().getId();
    Long chefId = conversation.getChef().getId();
    boolean isParticipant = currentUserId.equals(customerId) || currentUserId.equals(chefId);

    if (!isParticipant) {
      throw new ForbiddenException(ErrorCode.CONVERSATION_ACCESS_DENIED);
    }

    List<ChatMessage> messages = chatMessageService.findByConversationId(conversationId);

    List<ChatMessageResponse> responses =
        messages.stream()
            .map(
                msg ->
                    ChatMessageResponse.builder()
                        .id(msg.getId())
                        .conversationId(msg.getConversation().getId())
                        .senderId(msg.getSender().getId())
                        .senderName(msg.getSender().getUsername())
                        .messageType(msg.getMessageType())
                        .content(msg.getContent())
                        .sentAt(msg.getCreatedAt())
                        .read(msg.isRead())
                        .readAt(msg.getReadAt())
                        .replyToMessageId(
                            msg.getReplyToMessage() != null
                                ? msg.getReplyToMessage().getId()
                                : null)
                        .attachments(List.of()) // ponytail: fetch attachments from service
                        .build())
            .toList();

    return BaseResponse.build(responses, true);
  }
}
