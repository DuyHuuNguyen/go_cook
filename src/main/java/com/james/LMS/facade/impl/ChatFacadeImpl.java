package com.james.LMS.facade.impl;

import com.james.LMS.facade.ChatFacade;
import com.james.LMS.service.BookingPriceOfferService;
import com.james.LMS.service.ChatConversationAttachmentService;
import com.james.LMS.service.ChatConversationService;
import com.james.LMS.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatFacadeImpl implements ChatFacade {
  private final ChatConversationService chatConversationService;
  private final ChatConversationAttachmentService chatConversationAttachmentService;
  private final CloudinaryService cloudinaryService;
  private final BookingPriceOfferService bookingPriceOfferService;
}
