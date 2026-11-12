package com.james.LMS.repository;

import com.james.LMS.entity.ChatMessage;
import java.util.List;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
  List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

  long countByConversationIdAndSenderIdNotAndReadFalse(Long conversationId, Long senderId);

  @Query(
      "SELECT COUNT(m) FROM ChatMessage m WHERE (m.conversation.customer.id = :userId OR m.conversation.chef.id = :userId) AND m.sender.id <> :userId AND m.read = false")
  long countUnreadMessagesForUser(@Param("userId") Long userId);

  @Query(
      "SELECT m FROM ChatMessage m JOIN FETCH m.conversation c JOIN FETCH m.sender s "
          + "WHERE (c.customer.id = :userId OR c.chef.id = :userId) "
          + "AND s.id <> :userId AND m.read = false "
          + "ORDER BY m.createdAt DESC")
  List<ChatMessage> findUnreadMessagesForUser(@Param("userId") Long userId, Limit limit);

  @Modifying(clearAutomatically = true)
  @Query(
      "UPDATE ChatMessage m SET m.read = true, m.readAt = :readAt WHERE m.conversation.id = :conversationId AND m.sender.id <> :userId AND m.read = false")
  int markConversationMessagesAsRead(
      @Param("conversationId") Long conversationId,
      @Param("userId") Long userId,
      @Param("readAt") Long readAt);

  @Modifying(clearAutomatically = true)
  @Query(
      "UPDATE ChatMessage m SET m.read = true, m.readAt = :readAt "
          + "WHERE m.conversation.id IN (SELECT c.id FROM ChatConversation c WHERE c.customer.id = :userId OR c.chef.id = :userId) "
          + "AND m.sender.id <> :userId AND m.read = false")
  int markAllMessagesAsRead(@Param("userId") Long userId, @Param("readAt") Long readAt);
}
