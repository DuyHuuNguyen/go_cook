package com.james.LMS.service;

import com.james.LMS.entity.ChatConversation;
import java.util.List;
import java.util.Optional;

public interface ChatConversationService {
  ChatConversation save(ChatConversation chatConversation);

  Optional<ChatConversation> findById(Long id);

  List<ChatConversation> findByUserId(Long userId);

  List<ChatConversation> findByUserIdWithKeyset(Long userId, Long lastId, int limit);

  Optional<ChatConversation> findByBookingId(Long bookingId);

  List<ChatConversation> findByCustomerIdAndChefId(Long customerId, Long chefId);
}
