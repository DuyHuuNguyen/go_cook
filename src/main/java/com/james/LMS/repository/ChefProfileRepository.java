package com.james.LMS.repository;

import com.james.LMS.dto.ChefProfileDTO;
import com.james.LMS.entity.ChefProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ChefProfileRepository extends JpaRepository<ChefProfile,Long> {
    @Query("""
        SELECT new com.james.LMS.dto.ChefProfileDTO(
            cp.bio,
            cp.experienceYears
        )
        FROM ChefProfile cp
        WHERE cp.user.id = :userId
    """)
    Optional<ChefProfileDTO> findChefProfileByUserId(@Param("userId") Long userId);
}
