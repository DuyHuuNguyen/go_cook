package com.james.LMS.service.impl;

import com.james.LMS.repository.ChatConversationAttachmentRepository;
import com.james.LMS.service.ChatConversationAttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatConversationAttachmentServiceImpl implements ChatConversationAttachmentService {
  private final ChatConversationAttachmentRepository chatConversationAttachmentRepository;
}
