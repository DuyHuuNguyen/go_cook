package com.james.LMS.response;

import com.james.LMS.entity.ChatConversationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatConversationResponse {
  private Long id;
  private BookingInfo booking;
  private UserInfo customer;
  private UserInfo chef;
  private ChatConversationStatus status;
  private Long lastMessageAt;
  private Integer unreadCount;

  @Data
  @Builder
  @AllArgsConstructor
  @NoArgsConstructor
  public static class BookingInfo {
    private Long id;
    private String bookingCode;
    private BigDecimal totalAmount;
  }

  @Data
  @Builder
  @AllArgsConstructor
  @NoArgsConstructor
  public static class UserInfo {
    private Long id;
    private String name;
    private String avatar;
  }
}
