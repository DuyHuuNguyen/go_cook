package com.james.LMS.service.impl;

import com.james.LMS.entity.ChefProfile;
import com.james.LMS.entity.User;
import com.james.LMS.enums.ChefApplicationStatus;
import com.james.LMS.enums.ErrorCode;
import com.james.LMS.enums.RoleEnum;
import com.james.LMS.exception.EntityNotFoundException;
import com.james.LMS.repository.ChefProfileRepository;
import com.james.LMS.repository.RoleRepository;
import com.james.LMS.repository.UserRepository;
import com.james.LMS.request.BecomeChefRequest;
import com.james.LMS.response.ChefApplicationResponse;
import com.james.LMS.service.ChefApplicationService;
import com.james.LMS.service.ProvinceService;
import com.james.LMS.service.WardService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChefApplicationServiceImpl implements ChefApplicationService {
  private final ChefProfileRepository profiles;
  private final UserRepository users;
  private final RoleRepository roles;
  private final ProvinceService provinces;
  private final WardService wards;

  @Override
  @Transactional
  public void submit(Long userId, BecomeChefRequest request) {
    User user = lockUser(userId);
    ChefProfile profile = profiles.findByUserId(userId).orElse(null);
    if (profile != null
        && (!profile.isActive() || profile.getReviewStatus() != ChefApplicationStatus.REJECTED)) {
      throw new IllegalArgumentException("Hồ sơ đã tồn tại; chỉ hồ sơ bị từ chối được gửi lại.");
    }
    var province =
        provinces
            .findByCode(request.getProvinceCode())
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.PROVINCE_NOT_FOUND));
    var ward =
        wards
            .findByCode(request.getWardCode())
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.WARD_NOT_FOUND));
    if (!ward.getProvince().getCode().equals(province.getCode())) {
      throw new IllegalArgumentException("Phường/xã không thuộc tỉnh/thành phố đã chọn.");
    }
    if (profile == null) {
      profile = new ChefProfile();
      profile.addUser(user);
    }
    user.setPhone(request.getPhone());
    user.addProvince(province);
    user.addWard(ward);
    profile.setBio(request.getBio());
    profile.setExperienceYears(
        request.getExperienceYears() == null ? 0 : request.getExperienceYears());
    profile.setReviewStatus(ChefApplicationStatus.PENDING);
    profile.setReviewReason(null);
    profile.setSubmittedAt(System.currentTimeMillis());
    profile.setStatusChangedAt(profile.getSubmittedAt());
    profile.setStatusChangedBy(userId);
    user.addChefProfile(profiles.save(profile));
  }

  @Override
  public ChefApplicationResponse ownApplication(Long userId) {
    return ChefApplicationResponse.from(
        profiles
            .findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.CHEF_PROFILE_NOT_FOUND)));
  }

  @Override
  public ChefApplicationResponse detail(Long id) {
    return ChefApplicationResponse.from(find(id));
  }

  @Override
  public Page<ChefApplicationResponse> list(ChefApplicationStatus status, int page, int size) {
    if (page < 1 || size < 1 || size > 100) {
      throw new IllegalArgumentException("Page phải >= 1; size phải từ 1 đến 100.");
    }
    var pageable =
        PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "submittedAt", "id"));
    return (status == null
            ? profiles.findAll(pageable)
            : profiles.findByReviewStatus(status, pageable))
        .map(ChefApplicationResponse::from);
  }

  @Override
  @Transactional
  public ChefApplicationResponse review(
      Long id, Long actorId, ChefApplicationStatus target, String reason) {
    Long ownerId = find(id).getUser().getId();
    User user = lockUser(ownerId);
    // All writers take the owner lock before reading mutable state.
    ChefProfile profile = profiles.findByUserId(ownerId).orElseThrow();
    // Refresh the instance first read to find its owner after waiting for a concurrent reviewer.
    entityManager.refresh(profile);
    if (!profile.isActive() || !canTransition(profile.getReviewStatus(), target)) {
      throw new IllegalArgumentException("Không thể chuyển trạng thái hồ sơ theo yêu cầu.");
    }
    String normalizedReason = reason == null ? null : reason.trim();
    if ((target == ChefApplicationStatus.REJECTED || target == ChefApplicationStatus.SUSPENDED)
        && (normalizedReason == null || normalizedReason.isEmpty())) {
      throw new IllegalArgumentException("Bắt buộc nhập lý do từ chối hoặc tạm ngừng.");
    }
    if (normalizedReason != null && normalizedReason.length() > 1000) {
      throw new IllegalArgumentException("Lý do không được vượt quá 1000 ký tự.");
    }
    if (target == ChefApplicationStatus.APPROVED) {
      var role =
          roles
              .findRoleByRoleName(RoleEnum.ROLE_CHEF)
              .filter(r -> r.isActive())
              .orElseThrow(() -> new EntityNotFoundException(ErrorCode.ROLE_NOT_FOUND));
      roles.grantUserRole(user.getId(), role.getId());
      roles.activateUserRole(user.getId(), role.getId());
    }
    profile.setReviewStatus(target);
    profile.setReviewReason(normalizedReason);
    profile.setStatusChangedAt(System.currentTimeMillis());
    profile.setStatusChangedBy(actorId);
    return ChefApplicationResponse.from(profile);
  }

  @PersistenceContext private EntityManager entityManager;

  private static boolean canTransition(
      ChefApplicationStatus current, ChefApplicationStatus target) {
    if (current == ChefApplicationStatus.PENDING) {
      return target == ChefApplicationStatus.APPROVED || target == ChefApplicationStatus.REJECTED;
    }
    return (current == ChefApplicationStatus.APPROVED && target == ChefApplicationStatus.SUSPENDED)
        || (current == ChefApplicationStatus.SUSPENDED && target == ChefApplicationStatus.APPROVED);
  }

  @Override
  @Transactional
  public void requireApprovedSeller(Long userId) {
    lockUser(userId);
    var profile = profiles.findByUserId(userId).orElse(null);
    if (profile == null
        || !profile.isActive()
        || profile.getReviewStatus() != ChefApplicationStatus.APPROVED) {
      throw new AccessDeniedException("Chỉ đầu bếp đã được duyệt mới được đăng bán.");
    }
  }

  private User lockUser(Long id) {
    return users
        .lockScheduleOwner(id)
        .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));
  }

  private ChefProfile find(Long id) {
    return profiles
        .findById(id)
        .orElseThrow(() -> new EntityNotFoundException(ErrorCode.CHEF_PROFILE_NOT_FOUND));
  }
}
