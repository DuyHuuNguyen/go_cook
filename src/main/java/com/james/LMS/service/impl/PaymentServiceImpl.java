package com.james.LMS.service.impl;

import com.james.LMS.repository.PaymentRepository;
import com.james.LMS.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
  private final PaymentRepository paymentRepository;
}
