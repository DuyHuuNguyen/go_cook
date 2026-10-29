package com.james.LMS.booking;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.james.LMS.entity.Booking;
import com.james.LMS.entity.Dish;
import com.james.LMS.entity.User;
import com.james.LMS.repository.BookingRepository;
import com.james.LMS.request.BookingDishRequest;
import com.james.LMS.request.CreateBookingRequest;
import com.james.LMS.service.DishService;
import com.james.LMS.service.UserService;
import com.james.LMS.service.impl.BookingServiceImpl;
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
    request.setGuestCount(4);
    request.setDishes(List.of(requestedDish));

    when(userService.findById(10L)).thenReturn(Optional.of(customer));
    when(dishService.findByIds(List.of(20L))).thenReturn(List.of(dish));
    when(bookingRepository.save(any(Booking.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    Booking booking = bookingService.createBooking(request, 10L);

    assertNull(booking.getChef());
    assertEquals("PENDING", booking.getBookingStatus());
    assertEquals(0, booking.getTotalAmount().signum());
    assertEquals(1, booking.getDishes().size());
    assertEquals(booking, booking.getDishes().getFirst().getBooking());
    assertEquals("Roasted vegetables", booking.getDishes().getFirst().getDishName());
    assertEquals(2, booking.getDishes().getFirst().getQuantity());
  }
}
