package com.james.LMS.repository;

import com.james.LMS.entity.Role;
import com.james.LMS.enums.RoleEnum;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
  @Modifying
  @Query(
      value =
          "INSERT INTO user_roles (user_id, role_id) SELECT :userId, :roleId WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = :userId AND role_id = :roleId)",
      nativeQuery = true)
  void grantUserRole(@Param("userId") Long userId, @Param("roleId") Long roleId);

  @Modifying
  @Query(
      value =
          "UPDATE user_roles SET is_active = true WHERE user_id = :userId AND role_id = :roleId",
      nativeQuery = true)
  void activateUserRole(@Param("userId") Long userId, @Param("roleId") Long roleId);

  @Query(
      value =
          "SELECT r.* "
              + "FROM user_roles ur "
              + "JOIN roles r ON ur.role_id = r.id "
              + "WHERE ur.user_id = :userId "
              + "AND ur.is_active = true",
      nativeQuery = true)
  List<Role> findAllByUserId(@Param("userId") Long userId);

  Optional<Role> findRoleByRoleName(RoleEnum roleName);
}
