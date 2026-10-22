package com.james.LMS.repository;

import com.james.LMS.entity.location.Ward;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WardRepository extends JpaRepository<Ward,String> {
    @Query("""
    SELECT w
    FROM Ward w
    WHERE LOWER(w.fullName) LIKE LOWER(CONCAT('%', :fullName, '%')) OR
         LOWER(w.name) LIKE LOWER(CONCAT('%', :fullName, '%')) OR
         LOWER(w.fullNameEn) LIKE LOWER(CONCAT('%', :fullName, '%'))
    """)
    List<Ward> findByFullNameContaining(@Param("fullName") String fullName, Pageable pageable);


    @Query("""
    SELECT w
    FROM Ward w
    JOIN FETCH w.province
    WHERE w.code = :code
    """)
    Optional<Ward> findByCode(@Param("code") String code);
}
