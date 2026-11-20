package com.james.LMS.entity;

import com.james.LMS.enums.ChatConversationStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

@Entity
@Table(name = "chat_conversations")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class ChatConversation extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "customer_id", nullable = false)
  private User customer;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "chef_id", nullable = false)
  private User chef;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "booking_id")
  private Booking booking;

  @Enumerated(EnumType.STRING)
  @JdbcType(PostgreSQLEnumJdbcType.class)
  @Column(name = "status", nullable = false, columnDefinition = "chat_conversation_status")
  @Builder.Default
  private ChatConversationStatus status = ChatConversationStatus.ACTIVE;

  @Column(name = "last_message_at")
  private Long lastMessageAt;
}
