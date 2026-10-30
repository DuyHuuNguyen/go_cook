package com.james.LMS.repository;

import com.james.LMS.entity.User;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
  // Booking writers must take the same lock before checking Chef availability.
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select u from User u where u.id=:id and u.isActive=true")
  Optional<User> lockScheduleOwner(@Param("id") Long id);

  Optional<User> findByEmail(String email);

  @Query(value = """
      SELECT u.* FROM users u
      WHERE EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = u.id AND ur.is_active = true AND r.is_active = true
          AND r.role_name = 'ROLE_USER')
        AND NOT EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id
          WHERE ur.user_id = u.id AND ur.is_active = true AND r.is_active = true
            AND r.role_name = 'ROLE_SYSTEM_ADMIN')
        AND (:active IS NULL OR u.is_active = :active)
        AND (:keyword = '' OR u.username ILIKE '%' || :keyword || '%'
          OR u.email ILIKE '%' || :keyword || '%' OR u.phone ILIKE '%' || :keyword || '%')
      ORDER BY u.created_at DESC, u.id DESC
      """, countQuery = """
      SELECT count(*) FROM users u
      WHERE EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = u.id AND ur.is_active = true AND r.is_active = true
          AND r.role_name = 'ROLE_USER')
        AND NOT EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id
          WHERE ur.user_id = u.id AND ur.is_active = true AND r.is_active = true
            AND r.role_name = 'ROLE_SYSTEM_ADMIN')
        AND (:active IS NULL OR u.is_active = :active)
        AND (:keyword = '' OR u.username ILIKE '%' || :keyword || '%'
          OR u.email ILIKE '%' || :keyword || '%' OR u.phone ILIKE '%' || :keyword || '%')
      """, nativeQuery = true)
  Page<User> findManagedUsers(@Param("keyword") String keyword, @Param("active") Boolean active, Pageable pageable);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select u from User u where u.id=:id")
  Optional<User> lockById(@Param("id") Long id);

  Boolean existsUserByEmail(String email);

  @Query(value = "select u " + "from User u " + "where u.id = :id")
  Optional<User> findUserAndInstructorById(@Param("id") Long id);


  @Query("""
    SELECT DISTINCT u
    FROM User u
    LEFT JOIN FETCH u.roles
    WHERE u.id = :id
    """)
  Optional<User> findUserAndFetchRolesById(@Param("id") Long id);
}
