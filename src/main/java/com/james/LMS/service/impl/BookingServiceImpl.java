package com.james.LMS.service.impl;

import com.james.LMS.config.ChefBookingProperties;
import com.james.LMS.entity.Booking;
import com.james.LMS.entity.BookingItemDish;
import com.james.LMS.entity.ChefProfile;
import com.james.LMS.entity.Dish;
import com.james.LMS.entity.User;
import com.james.LMS.enums.ChefApplicationStatus;
import com.james.LMS.enums.ChefScheduleStatus;
import com.james.LMS.enums.ErrorCode;
import com.james.LMS.exception.EntityNotFoundException;
import com.james.LMS.repository.BookingRepository;
import com.james.LMS.repository.ChefProfileRepository;
import com.james.LMS.repository.ChefScheduleRepository;
import com.james.LMS.repository.DishRepository;
import com.james.LMS.request.CreateBookingRequest;
import com.james.LMS.response.MatchingChefResponse;
import com.james.LMS.service.BookingService;
import com.james.LMS.service.DishService;
import com.james.LMS.service.UserService;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Limit;
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
  private final ChefProfileRepository chefProfileRepository;
  private final ChefScheduleRepository chefScheduleRepository;
  private final DishRepository dishRepository;
  private final ChefBookingProperties chefBookingProperties;

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
            .wardCode(request.getWardCode())
            .provinceCode(request.getProvinceCode())
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

  @Override
  public Optional<Booking> findById(Long id) {
    return bookingRepository.findById(id);
  }

  @Override
  @Transactional(readOnly = true)
  public List<MatchingChefResponse> findMatchingChefs(Long bookingId, Long customerId) {
    Booking booking =
        bookingRepository
            .findByIdAndCustomer_IdAndIsActiveTrue(bookingId, customerId)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.BOOKING_NOT_FOUND));

    Map<Long, MatchingChefResponse.DishItem> requestedDishes = new LinkedHashMap<>();
    for (BookingItemDish item : booking.getDishes()) {
      requestedDishes.putIfAbsent(
          item.getDish().getId(),
          new MatchingChefResponse.DishItem(item.getDish().getId(), item.getDishName()));
    }
    if (requestedDishes.isEmpty() || booking.getProvinceCode() == null) {
      return List.of();
    }
    Instant preparationStart =
        booking.getScheduledAt().minus(chefBookingProperties.getPreparationDuration());
    if (!preparationStart.isAfter(Instant.now())) {
      return List.of();
    }

    List<ChefProfile> candidates =
        chefProfileRepository.findMatchingAreaChefs(
            booking.getProvinceCode(), booking.getWardCode(), ChefApplicationStatus.APPROVED);
    if (candidates.isEmpty()) {
      return List.of();
    }

    List<Long> dishIds = new ArrayList<>(requestedDishes.keySet());
    List<Long> profileIds = candidates.stream().map(ChefProfile::getId).toList();
    Map<Long, Set<Long>> matchedDishIdsByChef = new HashMap<>();
    for (Object[] pair : chefProfileRepository.findMatchedProfileDishIds(profileIds, dishIds)) {
      matchedDishIdsByChef
          .computeIfAbsent((Long) pair[0], ignored -> new HashSet<>())
          .add((Long) pair[1]);
    }
    // Existing chef-owned dishes use dishes.chef_id; newly linked shared dishes use chef_dishes.
    for (Object[] pair : dishRepository.findOwnedDishChefIds(dishIds)) {
      matchedDishIdsByChef
          .computeIfAbsent((Long) pair[0], ignored -> new HashSet<>())
          .add((Long) pair[1]);
    }

    List<Long> chefIds = candidates.stream().map(profile -> profile.getUser().getId()).toList();
    Set<Long> busyChefIds =
        new HashSet<>(
            chefScheduleRepository.findBusyChefIdsDuring(
                chefIds,
                preparationStart,
                booking.getScheduledAt(),
                Instant.now(),
                ChefScheduleStatus.CONFIRMED,
                ChefScheduleStatus.HELD));

    List<MatchingChefResponse> result = new ArrayList<>();
    Set<Long> returnedChefIds = new HashSet<>();
    for (ChefProfile profile : candidates) {
      User chef = profile.getUser();
      if (busyChefIds.contains(chef.getId()) || returnedChefIds.contains(chef.getId())) {
        continue;
      }
      Set<Long> matchedIds = matchedDishIdsByChef.getOrDefault(chef.getId(), Set.of());
      if (matchedIds.isEmpty()) {
        continue;
      }
      List<MatchingChefResponse.DishItem> matched = new ArrayList<>();
      List<MatchingChefResponse.DishItem> unmatched = new ArrayList<>();
      requestedDishes.forEach(
          (dishId, dish) -> (matchedIds.contains(dishId) ? matched : unmatched).add(dish));
      result.add(
          new MatchingChefResponse(
              chef.getId(),
              chef.getUsername(),
              profile.getBio(),
              String.valueOf(profile.getExperienceYears()),
              chef.getAvatarUrl(),
              matched.size(),
              requestedDishes.size(),
              matched,
              unmatched));
      returnedChefIds.add(chef.getId());
    }
    return result;
  }

  private static final int LIMIT_DEFAULT = 20;

  @Override
  @Transactional(readOnly = true)
  public List<Booking> findByLastIdAndChefIdOrderByIdDesc(Long lastId, Long chefId) {
    if (lastId == null || lastId <= 0) {
      return this.bookingRepository.findByChef_IdAndIsActiveTrueOrderByIdDesc(
          chefId, Limit.of(LIMIT_DEFAULT));
    }
    return this.bookingRepository.findByIdGreaterThanAndChef_IdAndIsActiveTrueOrderByIdDesc(
        lastId, chefId, Limit.of(LIMIT_DEFAULT));
  }

  @Override
  public Optional<Booking> findBookingByIdAndChefIdAndIsActiveTrue(Long id, Long chefId) {
    return this.bookingRepository.findBookingByIdAndChef_IdAndIsActiveTrue(id, chefId);
  }

  @Override
  public void save(Booking booking) {
    this.bookingRepository.save(booking);
  }

  private static final List<String> SUCCESS_BOOKING_STATUSES =
      List.of("CHEF_ACCEPT", "CONFIRMED", "COMPLETED");

  @Override
  @Transactional(readOnly = true)
  public Map<Long, ChefBookingStats> findChefBookingStats(List<Long> chefIds) {
    if (chefIds == null || chefIds.isEmpty()) {
      return Map.of();
    }
    Map<Long, ChefBookingStats> statsByChefId = new HashMap<>();
    for (Object[] row :
        this.bookingRepository.countChefBookingStats(chefIds, SUCCESS_BOOKING_STATUSES)) {
      Long chefId = (Long) row[0];
      int total = row[1] == null ? 0 : ((Number) row[1]).intValue();
      int successful = row[2] == null ? 0 : ((Number) row[2]).intValue();
      statsByChefId.put(chefId, new ChefBookingStats(total, successful));
    }
    return statsByChefId;
  }

  @Override
  @Transactional(readOnly = true)
  public Map<String, Long> countChefBookingsByStatus(Long chefId) {
    if (chefId == null) {
      return Map.of();
    }
    List<Object[]> rows = this.bookingRepository.countChefBookingsByStatus(chefId);
    Map<String, Long> stats = new HashMap<>();
    for (Object[] row : rows) {
      String status = (String) row[0];
      Long count = row[1] == null ? 0L : ((Number) row[1]).longValue();
      if (status != null) {
        stats.put(status, count);
      }
    }
    return stats;
  }

  @Override
  @Transactional(readOnly = true)
  public BigDecimal sumCompletedBookingAmountInPeriod(
      Long chefId, Instant startOfMonth, Instant endOfMonth) {
    if (chefId == null || startOfMonth == null || endOfMonth == null) {
      return BigDecimal.ZERO;
    }
    BigDecimal amount =
        this.bookingRepository.sumCompletedBookingAmountInPeriod(chefId, startOfMonth, endOfMonth);
    return amount != null ? amount : BigDecimal.ZERO;
  }
}
