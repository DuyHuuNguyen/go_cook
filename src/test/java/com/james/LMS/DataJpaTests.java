package com.james.LMS;

import com.james.LMS.dto.ChefProfileDTO;
import com.james.LMS.repository.ChefProfileRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
public class DataJpaTests {
    @Autowired
    private ChefProfileRepository chefProfileRepository;


    @Test
    void testQueryChefProfile(){
        long userId =  1l;
        Optional<ChefProfileDTO> chefProfileByUserId = this.chefProfileRepository.findChefProfileByUserId(userId);
        assertTrue(chefProfileByUserId.isPresent());
    }
}
