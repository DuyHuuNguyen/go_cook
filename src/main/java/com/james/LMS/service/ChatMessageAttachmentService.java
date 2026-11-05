package com.james.LMS.service;

import com.james.LMS.entity.ChatMessageAttachment;
import java.util.List;

public interface ChatMessageAttachmentService {
  List<ChatMessageAttachment> saveAll(List<ChatMessageAttachment> attachments);
}
