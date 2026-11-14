package com.james.LMS.chat;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.entity.Booking;
import com.james.LMS.entity.BookingPriceOffer;
import com.james.LMS.entity.ChatConversation;
import com.james.LMS.entity.ChatConversationStatus;
import com.james.LMS.entity.ChatMessage;
import com.james.LMS.entity.ChatMessageType;
import com.james.LMS.entity.User;
import com.james.LMS.enums.BookingPriceOfferStatus;
import com.james.LMS.exception.ForbiddenException;
import com.james.LMS.facade.impl.ConversationFacadeImpl;
import com.james.LMS.request.ChatMessageRequest;
import com.james.LMS.request.UpsertBookingOfferPriceRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.BookingPriceOfferResponse;
import com.james.LMS.response.ChatConversationResponse;
import com.james.LMS.response.ChatMessageResponse;
import com.james.LMS.response.KeySetPaginationResponse;
import com.james.LMS.service.BookingPriceOfferService;
import com.james.LMS.service.BookingService;
import com.james.LMS.service.ChatConversationService;
import com.james.LMS.service.ChatMessageAttachmentService;
import com.james.LMS.service.ChatMessageService;
import com.james.LMS.service.UserService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class ConversationFacadeImplTest {

  @Mock private ChatConversationService chatConversationService;
  @Mock private UserService userService;
  @Mock private BookingService bookingService;
  @Mock private BookingPriceOfferService bookingPriceOfferService;
  @Mock private ChatMessageService chatMessageService;
  @Mock private ChatMessageAttachmentService chatMessageAttachmentService;
  @Mock private SimpMessagingTemplate messagingTemplate;

  @InjectMocks private ConversationFacadeImpl conversationFacade;

  private User customer;
  private User chef;
  private Booking booking;
  private ChatConversation conversation;

  @BeforeEach
  void setUp() {
    customer = User.builder().id(10L).username("CustomerA").email("cust@test.com").build();
    chef = User.builder().id(20L).username("ChefB").email("chef@test.com").build();
    booking =
        Booking.builder()
            .id(100L)
            .bookingCode("BK-100")
            .customer(customer)
            .chef(chef)
            .totalAmount(BigDecimal.valueOf(500000))
            .build();
    conversation =
        ChatConversation.builder()
            .id(55L)
            .customer(customer)
            .chef(chef)
            .booking(booking)
            .status(ChatConversationStatus.ACTIVE)
            .lastMessageAt(1000L)
            .build();
  }

  @AfterEach
  void tearDown() {
    SecurityContextHolder.clearContext();
  }

  private void authenticateAs(User user) {
    SecurityUserDetails principal = SecurityUserDetails.build(user, List.of());
    SecurityContextHolder.getContext()
        .setAuthentication(new UsernamePasswordAuthenticationToken(principal, null, List.of()));
  }

  @Test
  void createBookingOfferPrice_broadcastsOfferAndConversationUpdates() {
    authenticateAs(chef);

    UpsertBookingOfferPriceRequest request = new UpsertBookingOfferPriceRequest();
    request.setBookingId(booking.getId());
    request.setChatConversationId(conversation.getId());
    request.setTotalAmount(BigDecimal.valueOf(650000));

    BookingPriceOffer savedOffer =
        BookingPriceOffer.builder()
            .id(77L)
            .booking(booking)
            .conversation(conversation)
            .sender(chef)
            .totalAmount(BigDecimal.valueOf(650000))
            .status(BookingPriceOfferStatus.PENDING)
            .createdAt(2000L)
            .build();

    when(chatConversationService.findById(conversation.getId()))
        .thenReturn(Optional.of(conversation));
    when(bookingService.findById(booking.getId())).thenReturn(Optional.of(booking));
    when(userService.findById(chef.getId())).thenReturn(Optional.of(chef));
    when(bookingPriceOfferService.save(any(BookingPriceOffer.class))).thenReturn(savedOffer);
    when(chatConversationService.save(any(ChatConversation.class))).thenReturn(conversation);
    when(bookingPriceOfferService.findLatestAcceptedByConversationId(conversation.getId()))
        .thenReturn(Optional.empty());

    BaseResponse<BookingPriceOfferResponse> response =
        conversationFacade.createBookingOfferPrice(request);

    assertTrue(response.isSuccess());
    assertEquals(77L, response.getData().getId());
    assertEquals(650000.0, response.getData().getTotalAmount());
    assertEquals(BookingPriceOfferStatus.PENDING, response.getData().getStatus());

    verify(messagingTemplate)
        .convertAndSend(eq("/topic/offers/" + conversation.getId()), eq(response.getData()));
    verify(messagingTemplate)
        .convertAndSend(
            eq("/topic/users/" + customer.getId() + "/conversations"),
            any(ChatConversationResponse.class));
    verify(messagingTemplate)
        .convertAndSend(
            eq("/topic/users/" + chef.getId() + "/conversations"),
            any(ChatConversationResponse.class));
  }

  @Test
  void getConversationOffers_returnsOrderedOffersForParticipant() {
    authenticateAs(customer);

    BookingPriceOffer offer =
        BookingPriceOffer.builder()
            .id(88L)
            .booking(booking)
            .conversation(conversation)
            .sender(chef)
            .totalAmount(BigDecimal.valueOf(700000))
            .status(BookingPriceOfferStatus.PENDING)
            .createdAt(3000L)
            .build();

    when(chatConversationService.findById(conversation.getId()))
        .thenReturn(Optional.of(conversation));
    when(bookingPriceOfferService.findByConversationId(conversation.getId()))
        .thenReturn(List.of(offer));

    BaseResponse<List<BookingPriceOfferResponse>> response =
        conversationFacade.getConversationOffers(conversation.getId());

    assertTrue(response.isSuccess());
    assertEquals(1, response.getData().size());
    assertEquals(88L, response.getData().get(0).getId());
  }

  @Test
  void getConversationOffers_deniesNonParticipant() {
    User stranger = User.builder().id(999L).username("Stranger").email("s@test.com").build();
    authenticateAs(stranger);

    when(chatConversationService.findById(conversation.getId()))
        .thenReturn(Optional.of(conversation));

    assertThrows(
        ForbiddenException.class,
        () -> conversationFacade.getConversationOffers(conversation.getId()));
  }

  @Test
  void acceptBookingOfferPrice_broadcastsAcceptedOfferAndUpdatedBookingAmount() {
    authenticateAs(customer);

    BookingPriceOffer pendingOffer =
        BookingPriceOffer.builder()
            .id(90L)
            .booking(booking)
            .conversation(conversation)
            .sender(chef)
            .totalAmount(BigDecimal.valueOf(620000))
            .status(BookingPriceOfferStatus.PENDING)
            .createdAt(4000L)
            .build();

    when(bookingPriceOfferService.findById(90L)).thenReturn(Optional.of(pendingOffer));
    when(bookingPriceOfferService.save(any(BookingPriceOffer.class))).thenReturn(pendingOffer);
    when(chatConversationService.save(any(ChatConversation.class))).thenReturn(conversation);
    when(bookingPriceOfferService.findLatestAcceptedByConversationId(conversation.getId()))
        .thenReturn(Optional.of(pendingOffer));

    BaseResponse<BookingPriceOfferResponse> response =
        conversationFacade.acceptBookingOfferPrice(90L);

    assertTrue(response.isSuccess());
    assertEquals(BookingPriceOfferStatus.ACCEPTED, response.getData().getStatus());

    verify(messagingTemplate)
        .convertAndSend(eq("/topic/offers/" + conversation.getId()), eq(response.getData()));

    ArgumentCaptor<ChatConversationResponse> convCaptor =
        ArgumentCaptor.forClass(ChatConversationResponse.class);
    verify(messagingTemplate)
        .convertAndSend(
            eq("/topic/users/" + chef.getId() + "/conversations"), convCaptor.capture());
    assertEquals(BigDecimal.valueOf(620000), convCaptor.getValue().getBooking().getTotalAmount());
  }

  @Test
  void sendMessage_notifiesRecipientAndCalculatesUnreadCount() {
    authenticateAs(chef);

    ChatMessageRequest request = new ChatMessageRequest();
    request.setConversationId(conversation.getId());
    request.setContent("Chào bạn, mình xác nhận lịch nấu nhé!");
    request.setMessageType(ChatMessageType.TEXT);

    ChatMessage savedMessage =
        ChatMessage.builder()
            .id(301L)
            .conversation(conversation)
            .sender(chef)
            .messageType(ChatMessageType.TEXT)
            .content(request.getContent())
            .read(false)
            .createdAt(5000L)
            .build();

    when(chatConversationService.findById(conversation.getId()))
        .thenReturn(Optional.of(conversation));
    when(userService.findById(chef.getId())).thenReturn(Optional.of(chef));
    when(chatMessageService.save(any(ChatMessage.class))).thenReturn(savedMessage);
    when(chatConversationService.save(any(ChatConversation.class))).thenReturn(conversation);
    when(chatMessageService.countUnreadInConversation(conversation.getId(), customer.getId()))
        .thenReturn(2L);
    when(chatMessageService.countUnreadInConversation(conversation.getId(), chef.getId()))
        .thenReturn(0L);

    BaseResponse<ChatMessageResponse> response = conversationFacade.sendMessage(request);

    assertTrue(response.isSuccess());
    assertEquals(301L, response.getData().getId());

    verify(messagingTemplate)
        .convertAndSend(
            eq("/topic/users/" + customer.getId() + "/messages"), eq(response.getData()));

    ArgumentCaptor<ChatConversationResponse> custConvCaptor =
        ArgumentCaptor.forClass(ChatConversationResponse.class);
    verify(messagingTemplate)
        .convertAndSend(
            eq("/topic/users/" + customer.getId() + "/conversations"), custConvCaptor.capture());
    assertEquals(2, custConvCaptor.getValue().getUnreadCount());
  }

  @Test
  void markConversationAsRead_marksMessagesAndBroadcastsZeroUnread() {
    authenticateAs(customer);

    when(chatConversationService.findById(conversation.getId()))
        .thenReturn(Optional.of(conversation));
    when(chatMessageService.markConversationAsRead(conversation.getId(), customer.getId()))
        .thenReturn(3);
    when(chatMessageService.countUnreadInConversation(conversation.getId(), customer.getId()))
        .thenReturn(0L);

    BaseResponse<ChatConversationResponse> response =
        conversationFacade.markConversationAsRead(conversation.getId());

    assertTrue(response.isSuccess());
    assertEquals(0, response.getData().getUnreadCount());
    verify(messagingTemplate)
        .convertAndSend(
            eq("/topic/users/" + customer.getId() + "/conversations"), eq(response.getData()));
  }

  @Test
  void getUnreadMessageCount_returnsTotalUnreadForCurrentUser() {
    authenticateAs(customer);
    when(chatMessageService.countTotalUnreadForUser(customer.getId())).thenReturn(5L);

    BaseResponse<Long> response = conversationFacade.getUnreadMessageCount();

    assertTrue(response.isSuccess());
    assertEquals(5L, response.getData());
  }

  @Test
  void getConversations_returnsKeysetPageWithHasNextWhenMoreThanPageSize() {
    authenticateAs(customer);

    List<ChatConversation> fetched =
        java.util.stream.LongStream.rangeClosed(1, 21)
            .<ChatConversation>mapToObj(
                i ->
                    ChatConversation.builder()
                        .id(100L - i)
                        .customer(customer)
                        .chef(chef)
                        .status(ChatConversationStatus.ACTIVE)
                        .lastMessageAt(1000L + i)
                        .build())
            .toList();

    when(chatConversationService.findByUserIdWithKeyset(customer.getId(), 0L, 21))
        .thenReturn(fetched);

    BaseResponse<KeySetPaginationResponse<ChatConversationResponse>> response =
        conversationFacade.getConversations(0L);

    assertTrue(response.isSuccess());
    assertEquals(20, response.getData().getData().size());
    assertTrue(response.getData().getHasNext());
    assertEquals(80L, response.getData().getLastId());
  }

  @Test
  void getConversations_returnsEmptyPageWithHasNextFalse() {
    authenticateAs(customer);
    when(chatConversationService.findByUserIdWithKeyset(customer.getId(), 50L, 21))
        .thenReturn(List.of());

    BaseResponse<KeySetPaginationResponse<ChatConversationResponse>> response =
        conversationFacade.getConversations(50L);

    assertTrue(response.isSuccess());
    assertTrue(response.getData().getData().isEmpty());
    assertFalse(response.getData().getHasNext());
    assertEquals(-1L, response.getData().getLastId());
  }

  @Test
  void getUnreadMessages_returnsUnreadIncomingMessagesForCurrentUser() {
    authenticateAs(customer);
    ChatMessage unreadMsg =
        ChatMessage.builder()
            .id(401L)
            .conversation(conversation)
            .sender(chef)
            .messageType(ChatMessageType.TEXT)
            .content("Bạn ơi xác nhận lịch nấu nhé")
            .read(false)
            .createdAt(9000L)
            .build();
    when(chatMessageService.findUnreadMessagesForUser(customer.getId(), 20))
        .thenReturn(List.of(unreadMsg));

    BaseResponse<List<ChatMessageResponse>> response = conversationFacade.getUnreadMessages();

    assertTrue(response.isSuccess());
    assertEquals(1, response.getData().size());
    assertEquals(401L, response.getData().get(0).getId());
    assertFalse(response.getData().get(0).isRead());
    assertEquals("ChefB", response.getData().get(0).getSenderName());
  }

  @Test
  void markMessageAsRead_marksUnreadMessageAsReadAndBroadcastsConversationUpdate() {
    authenticateAs(customer);
    ChatMessage unreadMsg =
        ChatMessage.builder()
            .id(402L)
            .conversation(conversation)
            .sender(chef)
            .messageType(ChatMessageType.TEXT)
            .content("Tin nhắn chưa đọc")
            .read(false)
            .createdAt(9100L)
            .build();
    when(chatMessageService.findById(402L)).thenReturn(Optional.of(unreadMsg));
    when(chatMessageService.save(any(ChatMessage.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(chatMessageService.countUnreadInConversation(conversation.getId(), customer.getId()))
        .thenReturn(0L);

    BaseResponse<ChatMessageResponse> response = conversationFacade.markMessageAsRead(402L);

    assertTrue(response.isSuccess());
    assertTrue(response.getData().isRead());
    assertNotNull(response.getData().getReadAt());
    verify(chatMessageService).save(unreadMsg);
    verify(messagingTemplate)
        .convertAndSend(
            eq("/topic/users/" + customer.getId() + "/conversations"),
            any(ChatConversationResponse.class));
  }

  @Test
  void markMessageAsRead_deniesNonParticipant() {
    User stranger = User.builder().id(999L).username("Stranger").email("stranger@test.com").build();
    authenticateAs(stranger);
    ChatMessage unreadMsg =
        ChatMessage.builder()
            .id(403L)
            .conversation(conversation)
            .sender(chef)
            .messageType(ChatMessageType.TEXT)
            .content("Private message")
            .read(false)
            .createdAt(9200L)
            .build();
    when(chatMessageService.findById(403L)).thenReturn(Optional.of(unreadMsg));

    assertThrows(
        com.james.LMS.exception.ForbiddenException.class,
        () -> conversationFacade.markMessageAsRead(403L));
  }

  @Test
  void markAllMessagesAsRead_marksAllUnreadForCurrentUser() {
    authenticateAs(customer);

    BaseResponse<Void> response = conversationFacade.markAllMessagesAsRead();

    assertTrue(response.isSuccess());
    verify(chatMessageService).markAllMessagesAsRead(customer.getId());
  }
}
