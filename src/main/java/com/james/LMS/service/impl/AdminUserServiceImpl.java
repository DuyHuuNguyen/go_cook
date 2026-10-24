package com.james.LMS.service.impl;

import com.james.LMS.entity.User;
import com.james.LMS.enums.ErrorCode;
import com.james.LMS.enums.RoleEnum;
import com.james.LMS.enums.TokenType;
import com.james.LMS.exception.EntityNotFoundException;
import com.james.LMS.repository.RoleRepository;
import com.james.LMS.repository.UserRepository;
import com.james.LMS.response.AdminUserResponse;
import com.james.LMS.service.AdminUserService;
import com.james.LMS.service.CacheService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {
  private final UserRepository users;
  private final RoleRepository roles;
  private final CacheService cache;

  @Override
  @Transactional(readOnly = true)
  public Page<AdminUserResponse> list(String keyword, String status, int page, int size) {
    if (page < 1 || size < 1 || size > 100) {
      throw new IllegalArgumentException("Page phải >= 1; size phải từ 1 đến 100.");
    }
    Boolean active = switch (status == null ? "" : status) {
      case "", "ALL" -> null;
      case "ACTIVE" -> true;
      case "LOCKED" -> false;
      default -> throw new IllegalArgumentException("Trạng thái tài khoản không hợp lệ.");
    };
    String search = keyword == null ? "" : keyword.trim();
    if (search.length() > 100) throw new IllegalArgumentException("Từ khóa quá dài.");
    return users.findManagedUsers(search, active, PageRequest.of(page - 1, size))
        .map(this::response);
  }

  @Override
  @Transactional(readOnly = true)
  public AdminUserResponse detail(Long id) {
    return response(managedUser(users.findById(id).orElseThrow(
        () -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND))));
  }

  @Override
  @Transactional
  public AdminUserResponse updateStatus(Long id, Long actorId, String status, String reason) {
    User user = managedUser(users.lockById(id).orElseThrow(
        () -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND)));
    if ("LOCKED".equals(status)) {
      String normalized = reason == null ? "" : reason.trim();
      if (normalized.isEmpty() || normalized.length() > 1000) {
        throw new IllegalArgumentException("Lý do khóa phải có từ 1 đến 1000 ký tự.");
      }
      if (!user.isActive()) throw new IllegalArgumentException("Tài khoản đã bị khóa.");
      user.lock(normalized, actorId);
      cache.delete(String.format(TokenType.ACCESS_TOKEN.getCacheKeyTemplate(), user.getEmail()));
      cache.delete(String.format(TokenType.REFRESH_TOKEN.getCacheKeyTemplate(), user.getEmail()));
    } else if ("ACTIVE".equals(status)) {
      if (user.isActive()) throw new IllegalArgumentException("Tài khoản đang hoạt động.");
      user.unlock();
    } else {
      throw new IllegalArgumentException("Trạng thái tài khoản không hợp lệ.");
    }
    users.saveAndFlush(user);
    return response(user);
  }

  private User managedUser(User user) {
    List<RoleEnum> userRoles = roleNames(user);
    if (!userRoles.contains(RoleEnum.ROLE_USER) || userRoles.contains(RoleEnum.ROLE_SYSTEM_ADMIN)) {
      throw new EntityNotFoundException(ErrorCode.USER_NOT_FOUND);
    }
    return user;
  }

  private List<RoleEnum> roleNames(User user) {
    return roles.findAllByUserId(user.getId()).stream()
        .filter(role -> role.isActive()).map(role -> role.getRoleName()).toList();
  }

  private AdminUserResponse response(User user) {
    return AdminUserResponse.from(user, roleNames(user));
  }
}
