package com.james.LMS.controller;

import com.james.LMS.config.SecurityConfig;
import com.james.LMS.facade.ConversationFacade;
import com.james.LMS.request.ChatMessageRequest;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ChatMessageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
public class ChatController {

  private final ConversationFacade conversationFacade;

  // WebSocket endpoint: /app/chat.send -> broadcast to /topic/messages
  @MessageMapping("/chat.send")
  @SendTo("/topic/messages")
  public ChatMessageResponse sendMessageViaWebSocket(@Payload ChatMessageRequest request) {
    BaseResponse<ChatMessageResponse> response = conversationFacade.sendMessage(request);
    return response.getData();
  }

  // REST API endpoint for sending messages
  @PostMapping("/api/v1/messages")
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(summary = "Send chat message with optional file attachments", tags = {"Chat APIs"})
  @SecurityRequirement(name = SecurityConfig.SECURITY_REQUIREMENT)
  @PreAuthorize("isAuthenticated()")
  @ResponseBody
  public BaseResponse<ChatMessageResponse> sendMessageViaRest(
      @Valid @RequestBody ChatMessageRequest request) {
    return conversationFacade.sendMessage(request);
  }
}
