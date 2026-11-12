package com.james.LMS.response;

import com.james.LMS.entity.ChatMessageType;
import java.util.List;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageResponse {
  private Long id;
  private Long conversationId;
  private Long senderId;
  private String senderName;
  private ChatMessageType messageType;
  private String content;
  private Long sentAt;
  private boolean read;
  private Long readAt;
  private Long replyToMessageId;
  private List<AttachmentResponse> attachments;

  @Data
  @Builder
  @AllArgsConstructor
  @NoArgsConstructor
  public static class AttachmentResponse {
    private Long id;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private Long fileSize;
  }
}
