package com.james.LMS.repository;

import com.james.LMS.entity.ChatMessageAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatConversationAttachmentRepository
    extends JpaRepository<ChatMessageAttachment, Long> {}
