package com.james.LMS.service.impl;

import com.james.LMS.entity.*;
import com.james.LMS.enums.ChefScheduleStatus;
import com.james.LMS.repository.BookingRepository;
import com.james.LMS.repository.ChefScheduleRepository;
import com.james.LMS.repository.DishRepository;
import com.james.LMS.repository.UserRepository;
import com.james.LMS.service.ChefScheduleService;
import java.math.BigDecimal;
import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChefScheduleServiceImpl implements ChefScheduleService {

  private final ChefScheduleRepository scheduleRepository;
  private final BookingRepository bookingRepository;
  private final DishRepository dishRepository;
  private final UserRepository userRepository;

  @Override
  @Transactional(readOnly = true)
  public List<ChefSchedule> findWeeklySchedules(
      Long chefId, Instant startOfWeek, Instant endOfWeek) {
    if (chefId == null || startOfWeek == null || endOfWeek == null) {
      return List.of();
    }
    return scheduleRepository.findWeeklySchedules(chefId, startOfWeek, endOfWeek);
  }

  @Override
  @Transactional
  public void seedMockSchedules(Long chefId) {
    if (chefId == null) return;

    User chef =
        userRepository
            .findById(chefId)
            .orElseThrow(() -> new IllegalArgumentException("Chef not found: " + chefId));

    User customer =
        userRepository
            .findByEmail("customer@test.com")
            .orElseGet(
                () -> {
                  User c =
                      User.builder()
                          .username("Nguyễn Văn A")
                          .email("customer@test.com")
                          .phone("0901234567")
                          .password("password123")
                          .build();
                  return userRepository.save(c);
                });

    // Create or find sample dishes for chef
    Dish dish1 = getOrCreateDish(chef, "Bò bít tết sốt tiêu đen");
    Dish dish2 = getOrCreateDish(chef, "Salad cá hồi Na Uy");
    Dish dish3 = getOrCreateDish(chef, "Tôm hùm nướng bơ tỏi");
    Dish dish4 = getOrCreateDish(chef, "Lẩu hải sản Tomyum");
    Dish dish5 = getOrCreateDish(chef, "Set BBQ thượng hạng");
    Dish dish6 = getOrCreateDish(chef, "Gà nướng thảo mộc");

    LocalDate baseSunday =
        LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
    ZoneId zone = ZoneId.systemDefault();

    record MockSlot(
        int dayOffset,
        int startH,
        int startM,
        int endH,
        int endM,
        String codePrefix,
        String address,
        int guests,
        BigDecimal amount,
        String bookingStatus,
        ChefScheduleStatus scheduleStatus,
        List<Dish> dishes) {}

    List<MockSlot> slots =
        List.of(
            new MockSlot(
                0,
                11,
                30,
                14,
                30,
                "GC-SUN",
                "123 Lê Lợi, P. Bến Nghé, Quận 1",
                4,
                BigDecimal.valueOf(850000),
                "COMPLETED",
                ChefScheduleStatus.COMPLETED,
                List.of(dish1, dish2)),
            new MockSlot(
                1,
                17,
                0,
                20,
                0,
                "GC-MON",
                "45 Thảo Điền, TP. Thủ Đức",
                2,
                BigDecimal.valueOf(1200000),
                "COMPLETED",
                ChefScheduleStatus.COMPLETED,
                List.of(dish3)),
            new MockSlot(
                2,
                10,
                0,
                13,
                0,
                "GC-TUE",
                "88 Nguyễn Thị Minh Khai, Quận 3",
                6,
                BigDecimal.valueOf(1500000),
                "CONFIRMED",
                ChefScheduleStatus.CONFIRMED,
                List.of(dish4, dish6)),
            new MockSlot(
                3,
                18,
                0,
                21,
                0,
                "GC-WED",
                "12 Mai Chí Thọ, Quận 2",
                8,
                BigDecimal.valueOf(2100000),
                "CONFIRMED",
                ChefScheduleStatus.CONFIRMED,
                List.of(dish5, dish2)),
            new MockSlot(
                4,
                11,
                0,
                14,
                0,
                "GC-THU",
                "78 Điện Biên Phủ, Bình Thạnh",
                5,
                BigDecimal.valueOf(1350000),
                "CONFIRMED",
                ChefScheduleStatus.CONFIRMED,
                List.of(dish2, dish6)),
            new MockSlot(
                5,
                16,
                30,
                19,
                30,
                "GC-FRI",
                "Landmark 81, P. 22, Bình Thạnh",
                4,
                BigDecimal.valueOf(980000),
                "PENDING",
                ChefScheduleStatus.HELD,
                List.of(dish1)),
            new MockSlot(
                6,
                9,
                30,
                12,
                30,
                "GC-SAT1",
                "Villa 28 Phú Mỹ Hưng, Quận 7",
                6,
                BigDecimal.valueOf(1800000),
                "CONFIRMED",
                ChefScheduleStatus.CONFIRMED,
                List.of(dish5, dish3)),
            new MockSlot(
                6,
                17,
                30,
                20,
                30,
                "GC-SAT2",
                "15 Pasteur, Bến Nghé, Quận 1",
                4,
                BigDecimal.valueOf(1100000),
                "PENDING",
                ChefScheduleStatus.HELD,
                List.of(dish1, dish4)),
            new MockSlot(
                7,
                11,
                0,
                14,
                0,
                "GC-NEXT",
                "36 Hoàng Diệu, Quận 4",
                6,
                BigDecimal.valueOf(1650000),
                "CONFIRMED",
                ChefScheduleStatus.CONFIRMED,
                List.of(dish3, dish6)));

    long suffix = System.currentTimeMillis() % 10000;
    int index = 0;
    for (MockSlot s : slots) {
      LocalDate date = baseSunday.plusDays(s.dayOffset());
      Instant startAt = date.atTime(s.startH(), s.startM()).atZone(zone).toInstant();
      Instant endAt = date.atTime(s.endH(), s.endM()).atZone(zone).toInstant();

      String bookingCode = s.codePrefix() + "-" + (suffix + (++index));

      Booking booking =
          Booking.builder()
              .bookingCode(bookingCode)
              .customer(customer)
              .chef(chef)
              .scheduledAt(startAt)
              .serviceAddress(s.address())
              .guestCount(s.guests())
              .totalAmount(s.amount())
              .bookingStatus(s.bookingStatus())
              .build();

      for (Dish d : s.dishes()) {
        booking.addDish(
            BookingItemDish.builder().dish(d).dishName(d.getName()).quantity(1).build());
      }

      booking = bookingRepository.save(booking);

      ChefSchedule schedule =
          ChefSchedule.builder()
              .chef(chef)
              .booking(booking)
              .startAt(startAt)
              .endAt(endAt)
              .status(s.scheduleStatus())
              .holdExpiresAt(
                  s.scheduleStatus() == ChefScheduleStatus.HELD
                      ? Instant.now().plusSeconds(86400)
                      : null)
              .build();

      scheduleRepository.save(schedule);
    }

    log.info("Successfully seeded {} mock schedules & bookings for chef {}", slots.size(), chefId);
  }

  private Dish getOrCreateDish(User chef, String name) {
    return dishRepository
        .findByName(name)
        .orElseGet(() -> dishRepository.save(Dish.builder().chef(chef).name(name).build()));
  }
}
