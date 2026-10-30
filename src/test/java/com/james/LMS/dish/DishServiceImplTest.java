package com.james.LMS.dish;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.james.LMS.entity.Dish;
import com.james.LMS.repository.DishRepository;
import com.james.LMS.service.impl.DishServiceImpl;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

@ExtendWith(MockitoExtension.class)
class DishServiceImplTest {
  @Mock private DishRepository dishRepository;
  @InjectMocks private DishServiceImpl dishService;

  @Test
  void searchByNameTrimsPartialQueryAndReturnsPage() {
    PageRequest pageable = PageRequest.of(0, 10);
    Page<Dish> expected =
        new PageImpl<>(List.of(Dish.builder().id(1L).name("Roasted tofu").build()));
    when(dishRepository.findByNameContainingIgnoreCaseAndIsActiveTrueOrderByNameAscIdAsc(
            "tofu", pageable))
        .thenReturn(expected);

    Page<Dish> result = dishService.searchByName(" tofu ", pageable);

    assertEquals(expected, result);
    verify(dishRepository)
        .findByNameContainingIgnoreCaseAndIsActiveTrueOrderByNameAscIdAsc("tofu", pageable);
  }
}
