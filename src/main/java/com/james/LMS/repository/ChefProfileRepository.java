package com.james.LMS.repository;

import com.james.LMS.dto.ChefProfileDTO;
import com.james.LMS.entity.ChefProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;
import java.util.List;

import java.util.Optional;

@Repository
public interface ChefProfileRepository extends JpaRepository<ChefProfile,Long> {
    @Query("""
        select cp from ChefProfile cp join fetch cp.user u
        where cp.isActive = true and u.isActive = true
        order by cp.updatedAt desc, cp.id desc
        """)
    List<ChefProfile> findPublicChefs(Pageable pageable);

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
