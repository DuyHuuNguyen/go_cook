package com.james.LMS;

import static org.junit.jupiter.api.Assertions.assertTrue;

import com.james.LMS.dto.ChefProfileDTO;
import com.james.LMS.repository.ChefProfileRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
public class DataJpaTests {
  @Autowired private ChefProfileRepository chefProfileRepository;

  @Test
  void testQueryChefProfile() {
    long userId = 1l;
    Optional<ChefProfileDTO> chefProfileByUserId =
        this.chefProfileRepository.findChefProfileByUserId(userId);
    assertTrue(chefProfileByUserId.isPresent());
  }
}
