package com.james.LMS.repository;

import com.james.LMS.entity.ChatConversation;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {
  @Query(
      "SELECT c FROM ChatConversation c WHERE c.customer.id = :userId OR c.chef.id = :userId ORDER BY c.lastMessageAt DESC")
  List<ChatConversation> findByUserId(@Param("userId") Long userId);
}
