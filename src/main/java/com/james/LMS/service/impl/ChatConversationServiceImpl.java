package com.james.LMS.service.impl;

import com.james.LMS.entity.ChatConversation;
import com.james.LMS.repository.ChatConversationRepository;
import com.james.LMS.service.ChatConversationService;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatConversationServiceImpl implements ChatConversationService {
  private final ChatConversationRepository chatConversationRepository;

  @Override
  public ChatConversation save(ChatConversation chatConversation) {
    return chatConversationRepository.save(chatConversation);
  }

  @Override
  public Optional<ChatConversation> findById(Long id) {
    return chatConversationRepository.findById(id);
  }

  @Override
  public List<ChatConversation> findByUserId(Long userId) {
    return chatConversationRepository.findByUserId(userId);
  }
}
