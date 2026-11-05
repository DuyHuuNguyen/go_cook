package com.james.LMS.service.impl;

import com.james.LMS.entity.ChatMessageAttachment;
import com.james.LMS.repository.ChatMessageAttachmentRepository;
import com.james.LMS.service.ChatMessageAttachmentService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatMessageAttachmentServiceImpl implements ChatMessageAttachmentService {
  private final ChatMessageAttachmentRepository chatMessageAttachmentRepository;

  @Override
  public List<ChatMessageAttachment> saveAll(List<ChatMessageAttachment> attachments) {
    return chatMessageAttachmentRepository.saveAll(attachments);
  }
}
