package com.james.LMS.service;

import com.james.LMS.entity.ChatMessage;
import java.util.List;
import java.util.Optional;

public interface ChatMessageService {
  ChatMessage save(ChatMessage chatMessage);

  Optional<ChatMessage> findById(Long id);

  List<ChatMessage> findByConversationId(Long conversationId);

  long countUnreadInConversation(Long conversationId, Long userId);

  long countTotalUnreadForUser(Long userId);

  List<ChatMessage> findUnreadMessagesForUser(Long userId, int limit);

  int markConversationAsRead(Long conversationId, Long userId);

  int markAllMessagesAsRead(Long userId);
}
