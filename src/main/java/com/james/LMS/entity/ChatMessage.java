package com.james.LMS.entity;

import com.james.LMS.enums.ChatMessageType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class ChatMessage extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "conversation_id", nullable = false)
  private ChatConversation conversation;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "sender_user_id", nullable = false)
  private User sender;

  @Enumerated(EnumType.STRING)
  @JdbcType(PostgreSQLEnumJdbcType.class)
  @Column(name = "message_type", nullable = false, columnDefinition = "chat_message_type")
  @Builder.Default
  private ChatMessageType messageType = ChatMessageType.TEXT;

  @Column(name = "content", columnDefinition = "TEXT")
  private String content;

  @Column(name = "is_read", nullable = false)
  @Builder.Default
  private boolean read = false;

  @Column(name = "read_at")
  private Long readAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "reply_to_message_id")
  private ChatMessage replyToMessage;
}
