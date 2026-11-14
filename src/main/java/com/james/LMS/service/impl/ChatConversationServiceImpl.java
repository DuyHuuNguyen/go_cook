package com.james.LMS.service.impl;

import com.james.LMS.entity.ChatConversation;
import com.james.LMS.repository.ChatConversationRepository;
import com.james.LMS.service.ChatConversationService;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Limit;
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

  @Override
  public List<ChatConversation> findByUserIdWithKeyset(Long userId, Long lastId, int limit) {
    if (lastId == null || lastId <= 0) {
      return chatConversationRepository.findByUserIdOrderByIdDesc(userId, Limit.of(limit));
    }
    return chatConversationRepository.findByUserIdAndIdLessThanOrderByIdDesc(
        userId, lastId, Limit.of(limit));
  }

  @Override
  public Optional<ChatConversation> findByBookingId(Long bookingId) {
    return chatConversationRepository.findByBookingId(bookingId);
  }

  @Override
  public List<ChatConversation> findByCustomerIdAndChefId(Long customerId, Long chefId) {
    return chatConversationRepository.findByCustomerIdAndChefId(customerId, chefId);
  }
}
