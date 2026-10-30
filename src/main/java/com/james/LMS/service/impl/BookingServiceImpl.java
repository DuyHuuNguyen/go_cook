package com.james.LMS.service.impl;

import com.james.LMS.entity.Booking;
import com.james.LMS.entity.BookingItemDish;
import com.james.LMS.entity.Dish;
import com.james.LMS.entity.User;
import com.james.LMS.enums.ErrorCode;
import com.james.LMS.exception.EntityNotFoundException;
import com.james.LMS.repository.BookingRepository;
import com.james.LMS.request.CreateBookingRequest;
import com.james.LMS.service.BookingService;
import com.james.LMS.service.DishService;
import com.james.LMS.service.UserService;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {
  private final BookingRepository bookingRepository;
  private final DishService dishService;
  private final UserService userService;

  @Override
  @Transactional
  public Booking createBooking(CreateBookingRequest request, Long customerId) {
    User customer =
        userService
            .findById(customerId)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));

    var dishIds = request.getDishes().stream().map(item -> item.getDishId()).toList();
    if (dishIds.stream().distinct().count() != dishIds.size()) {
      throw new IllegalArgumentException("A dish can only appear once in a booking");
    }

    Map<Long, Dish> dishesById =
        dishService.findByIds(dishIds).stream()
            .collect(Collectors.toMap(Dish::getId, Function.identity()));
    if (dishesById.size() != dishIds.size()) {
      throw new EntityNotFoundException(ErrorCode.DISH_NOT_FOUND);
    }

    Booking booking =
        Booking.builder()
            .bookingCode("BK-" + UUID.randomUUID().toString().replace("-", ""))
            .customer(customer)
            .chef(null)
            .scheduledAt(request.getScheduledAt())
            .serviceAddress(request.getServiceAddress())
            .customerNote(request.getCustomerNote())
            .guestCount(request.getGuestCount())
            .totalAmount(BigDecimal.ZERO)
            .bookingStatus("PENDING")
            .build();

    request
        .getDishes()
        .forEach(
            item -> {
              Dish dish = dishesById.get(item.getDishId());
              booking.addDish(
                  BookingItemDish.builder()
                      .dish(dish)
                      .dishName(dish.getName())
                      .quantity(item.getQuantity())
                      .build());
            });

    return bookingRepository.save(booking);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<Booking> findCustomerBookings(Long customerId, Pageable pageable) {
    return bookingRepository.findByCustomer_IdAndIsActiveTrue(customerId, pageable);
  }
}
