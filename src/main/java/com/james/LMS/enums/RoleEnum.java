package com.james.LMS.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RoleEnum {
  ROLE_USER("ROLE_USER"),
  ROLE_SYSTEM_ADMIN("ROLE_SYSTEM_ADMIN"),
  ROLE_CHEF("ROLE_CHEF");

  private final String content;
}
