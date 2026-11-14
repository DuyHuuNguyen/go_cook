package com.james.LMS.repository;

import com.james.LMS.dto.ChefProfileDTO;
import com.james.LMS.entity.ChefProfile;
import com.james.LMS.enums.ChefApplicationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChefProfileRepository extends JpaRepository<ChefProfile, Long> {
  Optional<ChefProfile> findByUserId(Long userId);

  Page<ChefProfile> findByReviewStatus(ChefApplicationStatus status, Pageable pageable);

  @Query("""
      select cp from ChefProfile cp join fetch cp.user u
      where cp.isActive = true and u.isActive = true
      and cp.reviewStatus = com.james.LMS.enums.ChefApplicationStatus.APPROVED
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

  @Query("""
      select distinct cp from ChefProfile cp join fetch cp.user u
      where cp.isActive = true and u.isActive = true
        and cp.reviewStatus = :approvedStatus
        and exists (
          select area.id from ChefServiceArea area
          where area.chefProfile = cp and area.isActive = true
            and area.province.code = :provinceCode
            and (area.ward is null or area.ward.code = :wardCode)
        )
      """)
  List<ChefProfile> findMatchingAreaChefs(
      @Param("provinceCode") String provinceCode,
      @Param("wardCode") String wardCode,
      @Param("approvedStatus") ChefApplicationStatus approvedStatus);

  @Query("""
      select cp.user.id, d.id from ChefProfile cp join cp.dishes d
      where cp.id in :profileIds and d.id in :dishIds and d.isActive = true
      """)
  List<Object[]> findMatchedProfileDishIds(
      @Param("profileIds") List<Long> profileIds, @Param("dishIds") List<Long> dishIds);

  @Query(value = """
      select exists (
        select 1 from user_roles ur join roles r on r.id = ur.role_id
        where ur.user_id = :userId and ur.is_active = true
          and r.is_active = true and r.role_name = 'ROLE_CHEF'
      )
      """, nativeQuery = true)
  boolean hasActiveChefRole(@Param("userId") Long userId);

  @Query("""
      select count(area.id) from ChefServiceArea area
      where area.chefProfile.id = :profileId and area.isActive = true
        and area.province.code = :provinceCode
        and (area.ward is null or area.ward.code = :wardCode)
      """)
  long countMatchingServiceAreas(
      @Param("profileId") Long profileId,
      @Param("provinceCode") String provinceCode,
      @Param("wardCode") String wardCode);

  @Query("""
      select area.province.code,
             coalesce(area.province.fullName, area.province.name),
             w.code,
             coalesce(w.fullName, w.name)
      from ChefServiceArea area
      left join area.ward w
      where area.chefProfile.user.id = :chefId
        and area.isActive = true
        and area.chefProfile.isActive = true
      order by area.id asc
      """)
  List<Object[]> findActiveServiceAreasByChefUserId(@Param("chefId") Long chefId);
}
