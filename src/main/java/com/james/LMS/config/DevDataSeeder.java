package com.james.LMS.config;

import com.james.LMS.entity.*;
import com.james.LMS.enums.RoleEnum;
import com.james.LMS.repository.*;
import com.james.LMS.service.ChatConversationService;
import com.james.LMS.service.ChatMessageService;
import com.james.LMS.service.UserService;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DevDataSeeder {

  private final UserService userService;
  private final RoleRepository roleRepository;
  private final BookingRepository bookingRepository;
  private final ChatConversationService chatConversationService;
  private final ChatMessageService chatMessageService;
  private final PasswordEncoder passwordEncoder;

  @Bean
  CommandLineRunner seedChatData() {
    return args -> {
      log.info("Seeding development chat data...");

      // Create roles if not exist
      Role customerRole =
          roleRepository
              .findRoleByRoleName(RoleEnum.ROLE_USER)
              .orElseGet(
                  () ->
                      roleRepository.save(
                          Role.builder().roleName(RoleEnum.ROLE_USER).build()));
      Role chefRole =
          roleRepository
              .findRoleByRoleName(RoleEnum.ROLE_CHEF)
              .orElseGet(
                  () -> roleRepository.save(Role.builder().roleName(RoleEnum.ROLE_CHEF).build()));

      // Create or get test customer
      User customer =
          userService
              .findByEmail("customer@test.com")
              .orElseGet(
                  () -> {
                    User user =
                        User.builder()
                            .username("Nguyễn Văn A")
                            .email("customer@test.com")
                            .phone("0901234567")
                            .password(passwordEncoder.encode("password123"))
                            .build();
                    user.addRole(customerRole);
                    return userService.save(user);
                  });

      // Create or get test chef
      User chef =
          userService
              .findByEmail("chef@test.com")
              .orElseGet(
                  () -> {
                    User user =
                        User.builder()
                            .username("Chef Minh")
                            .email("chef@test.com")
                            .phone("0907654321")
                            .password(passwordEncoder.encode("password123"))
                            .build();
                    user.addRole(chefRole);
                    return userService.save(user);
                  });

      // Check if conversation already exists
      List<ChatConversation> existing = chatConversationService.findByUserId(customer.getId());
      if (!existing.isEmpty()) {
        log.info("Chat data already exists for customer, skipping seed");
        return;
      }

      // Create test booking
      Booking booking =
          Booking.builder()
              .bookingCode("GC-" + System.currentTimeMillis())
              .customer(customer)
              .chef(chef)
              .scheduledAt(Instant.now().plusSeconds(86400))
              .serviceAddress("123 Test Street, Ho Chi Minh City")
              .guestCount(4)
              .totalAmount(BigDecimal.valueOf(430000))
              .bookingStatus("PENDING")
              .build();
      booking = bookingRepository.save(booking);

      // Create conversation
      ChatConversation conversation =
          ChatConversation.builder()
              .customer(customer)
              .chef(chef)
              .booking(booking)
              .status(ChatConversationStatus.ACTIVE)
              .lastMessageAt(System.currentTimeMillis() - 7200000) // 2 hours ago
              .build();
      conversation = chatConversationService.save(conversation);

      // Create messages
      long now = System.currentTimeMillis();
      long yesterday = now - 86400000;

      ChatMessage msg1 =
          ChatMessage.builder()
              .conversation(conversation)
              .sender(chef)
              .messageType(ChatMessageType.TEXT)
              .content("Chào bạn, tôi đã nhận được đơn hàng của bạn")
              .read(true)
              .build();
      chatMessageService.save(msg1);

      ChatMessage msg2 =
          ChatMessage.builder()
              .conversation(conversation)
              .sender(customer)
              .messageType(ChatMessageType.TEXT)
              .content("Cảm ơn chef! Giá 430k có thương lượng được không ạ?")
              .read(true)
              .build();
      chatMessageService.save(msg2);

      ChatMessage msg3 =
          ChatMessage.builder()
              .conversation(conversation)
              .sender(chef)
              .messageType(ChatMessageType.TEXT)
              .content("Xin lỗi bạn, giá này chưa bao gồm chi phí nguyên liệu cao cấp")
              .read(true)
              .build();
      chatMessageService.save(msg3);

      ChatMessage msg4 =
          ChatMessage.builder()
              .conversation(conversation)
              .sender(customer)
              .messageType(ChatMessageType.TEXT)
              .content("Vậy 400k được không ạ?")
              .read(false)
              .build();
      chatMessageService.save(msg4);

      log.info("Development chat data seeded successfully!");
      log.info(
          "Test accounts - Customer: customer@test.com / Chef: chef@test.com (password:"
              + " password123)");
      log.info("Customer ID: {}, Chef ID: {}", customer.getId(), chef.getId());
    };
  }
}
