package com.james.LMS.booking;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.james.LMS.entity.Booking;
import com.james.LMS.entity.BookingItemDish;
import com.james.LMS.entity.ChefProfile;
import com.james.LMS.entity.Dish;
import com.james.LMS.entity.User;
import com.james.LMS.enums.PaymentMethod;
import com.james.LMS.repository.BookingRepository;
import com.james.LMS.repository.PaymentRepository;
import com.james.LMS.request.BookingDishRequest;
import com.james.LMS.request.CreateBookingRequest;
import com.james.LMS.response.BookingDetailResponse;
import com.james.LMS.response.BookingResponse;
import com.james.LMS.service.DishService;
import com.james.LMS.service.UserService;
import com.james.LMS.service.impl.BookingServiceImpl;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {
  @Mock private BookingRepository bookingRepository;
  @Mock private PaymentRepository paymentRepository;
  @Mock private DishService dishService;
  @Mock private UserService userService;
  @InjectMocks private BookingServiceImpl bookingService;

  @Test
  void createBookingLeavesChefUnassignedAndIncludesDishSnapshots() {
    User customer = User.builder().id(10L).build();
    Dish dish = Dish.builder().id(20L).name("Roasted vegetables").build();
    BookingDishRequest requestedDish = new BookingDishRequest();
    requestedDish.setDishId(20L);
    requestedDish.setQuantity(2);
    CreateBookingRequest request = new CreateBookingRequest();
    request.setScheduledAt(Instant.now().plusSeconds(3600));
    request.setServiceAddress("123 Main Street");
    request.setWardCode("WARD-1");
    request.setProvinceCode("PROVINCE-1");
    request.setGuestCount(4);
    request.setDishes(List.of(requestedDish));

    when(userService.findById(10L)).thenReturn(Optional.of(customer));
    when(dishService.findByIds(List.of(20L))).thenReturn(List.of(dish));
    when(bookingRepository.save(any(Booking.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    Booking booking = bookingService.createBooking(request, 10L);

    assertNull(booking.getChef());
    assertEquals("PENDING", booking.getBookingStatus());
    assertEquals("WARD-1", booking.getWardCode());
    assertEquals("PROVINCE-1", booking.getProvinceCode());
    assertEquals(0, booking.getTotalAmount().signum());
    assertEquals(1, booking.getDishes().size());
    assertEquals(booking, booking.getDishes().getFirst().getBooking());
    assertEquals("Roasted vegetables", booking.getDishes().getFirst().getDishName());
    assertEquals(2, booking.getDishes().getFirst().getQuantity());

    BookingResponse response = BookingResponse.from(booking);
    assertEquals("WARD-1", response.wardCode());
    assertEquals("PROVINCE-1", response.provideCode());
  }

  @Test
  void findBookingDetailsReturnsCheckoutInformationAndDefaultsPaymentToVnpay() {
    Dish dish = Dish.builder().id(20L).name("Roasted vegetables").build();
    BookingItemDish bookingDish =
        BookingItemDish.builder().dish(dish).dishName("Roasted vegetables").quantity(2).build();
    ChefProfile chefProfile =
        ChefProfile.builder().bio("Seasonal home cooking").experienceYears(4).build();
    User chef =
        User.builder()
            .id(30L)
            .username("Chef Alex")
            .avatarUrl("https://example.com/chef.png")
            .chefProfile(chefProfile)
            .build();
    Booking booking =
        Booking.builder()
            .id(40L)
            .chef(chef)
            .bookingStatus("PENDING_CHEF_ACCEPTANCE")
            .scheduledAt(Instant.parse("2026-12-01T10:00:00Z"))
            .serviceAddress("123 Main Street")
            .guestCount(4)
            .customerNote("No peanuts")
            .totalAmount(new BigDecimal("125000"))
            .dishes(List.of(bookingDish))
            .build();
    when(bookingRepository.findDetailsByIdAndCustomer_IdAndIsActiveTrue(40L, 10L))
        .thenReturn(Optional.of(booking));
    when(paymentRepository.findFirstByBooking_IdAndIsActiveTrueOrderByIdDesc(40L))
        .thenReturn(Optional.empty());

    BookingDetailResponse response = bookingService.findBookingDetails(40L, 10L);

    assertEquals(40L, response.bookingInformation().bookingId());
    assertEquals("PENDING_CHEF_ACCEPTANCE", response.bookingInformation().bookingStatus());
    assertEquals("123 Main Street", response.bookingInformation().serviceAddress());
    assertEquals("No peanuts", response.bookingInformation().customerNote());
    assertEquals(30L, response.chefInformation().chefId());
    assertEquals("Chef Alex", response.chefInformation().chefName());
    assertEquals("https://example.com/chef.png", response.chefInformation().chefAvatar());
    assertEquals(4, response.chefInformation().experienceYears());
    assertEquals(20L, response.menuInformation().dishes().getFirst().dishId());
    assertEquals("Roasted vegetables", response.menuInformation().dishes().getFirst().dishName());
    assertEquals(2, response.menuInformation().dishes().getFirst().quantity());
    assertEquals(PaymentMethod.VNPAY, response.paymentInformation().paymentMethod());
    assertNull(response.paymentInformation().status());
    assertEquals(new BigDecimal("125000"), response.paymentInformation().amount());
  }
}
