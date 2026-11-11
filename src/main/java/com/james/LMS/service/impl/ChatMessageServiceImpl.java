package com.james.LMS.service.impl;

import com.james.LMS.entity.ChatMessage;
import com.james.LMS.repository.ChatMessageRepository;
import com.james.LMS.service.ChatMessageService;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatMessageServiceImpl implements ChatMessageService {
  private final ChatMessageRepository chatMessageRepository;

  @Override
  public ChatMessage save(ChatMessage chatMessage) {
    return chatMessageRepository.save(chatMessage);
  }

  @Override
  public Optional<ChatMessage> findById(Long id) {
    return chatMessageRepository.findById(id);
  }

  @Override
  public List<ChatMessage> findByConversationId(Long conversationId) {
    return chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
  }

  @Override
  public long countUnreadInConversation(Long conversationId, Long userId) {
    return chatMessageRepository.countByConversationIdAndSenderIdNotAndReadFalse(
        conversationId, userId);
  }

  @Override
  public long countTotalUnreadForUser(Long userId) {
    return chatMessageRepository.countUnreadMessagesForUser(userId);
  }

  @Override
  public int markConversationAsRead(Long conversationId, Long userId) {
    return chatMessageRepository.markConversationMessagesAsRead(
        conversationId, userId, System.currentTimeMillis());
  }
}
