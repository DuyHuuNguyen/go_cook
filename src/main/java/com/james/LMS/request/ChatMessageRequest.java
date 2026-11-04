package com.james.LMS.request;

import com.james.LMS.entity.ChatMessageType;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Data;

@Data
public class ChatMessageRequest {
  @NotNull(message = "Conversation ID is required")
  private Long conversationId;

  private String content;

  private ChatMessageType messageType;

  private Long replyToMessageId;

  private List<AttachmentRequest> attachments;

  @Data
  public static class AttachmentRequest {
    @NotNull(message = "File URL is required")
    private String fileUrl;

    private String fileName;
    private String fileType;
    private Long fileSize;
  }
}
