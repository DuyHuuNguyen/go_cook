package com.james.LMS.response;

import com.james.LMS.entity.User;
import com.james.LMS.enums.RoleEnum;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminUserResponse {
  private final Long id;
  private final String username;
  private final String email;
  private final String phone;
  private final List<RoleEnum> roles;
  private final String status;
  private final String lockReason;
  private final Long lockedAt;
  private final Long lockedBy;
  private final Long createdAt;

  public static AdminUserResponse from(User user, List<RoleEnum> roles) {
    return new AdminUserResponse(
        user.getId(),
        user.getUsername(),
        user.getEmail(),
        user.getPhone(),
        roles,
        user.isActive() ? "ACTIVE" : "LOCKED",
        user.getLockReason(),
        user.getLockedAt(),
        user.getLockedBy(),
        user.getCreatedAt());
  }
}
