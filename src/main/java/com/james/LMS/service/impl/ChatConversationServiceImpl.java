package com.james.LMS.service.impl;

import com.james.LMS.repository.ChatConversationRepository;
import com.james.LMS.service.ChatConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatConversationServiceImpl implements ChatConversationService {
  private final ChatConversationRepository chatConversationRepository;
}
