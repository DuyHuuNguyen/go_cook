package com.james.LMS.facade.impl;

import com.james.LMS.config.SecurityUserDetails;
import com.james.LMS.dto.ChefProfileDTO;
import com.james.LMS.dto.MessageMailDTO;
import com.james.LMS.entity.Role;
import com.james.LMS.entity.User;
import com.james.LMS.enums.*;
import com.james.LMS.exception.*;
import com.james.LMS.facade.UserFacade;
import com.james.LMS.request.*;
import com.james.LMS.response.*;
import com.james.LMS.service.*;
import com.james.LMS.util.MailUtil;
import com.james.LMS.util.OTPGeneratorUtil;
import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserFacadeImpl implements UserFacade {
  private static final int OTP_TTL_MINUTES = 10;
  private static final int OTP_RESEND_COOLDOWN_SECONDS = 60;
  private static final int RESET_TOKEN_TTL_MINUTES = 15;

  private final UserService userService;
  private final JwtService jwtService;
  private final CacheService cacheService;
  private final PasswordEncoder passwordEncoder;
  private final RoleService roleService;
  private final MailProducerService mailProducerService;
  private final CloudinaryService cloudinaryService;
  private final ChefProfileService chefProfileService;

  @Override
  @Transactional
  public BaseResponse<Void> signUp(UpsertUserRequest upsertUserRequest) {
    String email = normalizeEmail(upsertUserRequest.getEmail());

    boolean isExistUser = this.userService.existsUserByEmail(email);
    if (isExistUser) throw new UserAlreadyExistException(ErrorCode.USER_ALREADY_EXISTS);

    String passwordEncoded = this.passwordEncoder.encode(upsertUserRequest.getPassword());
    User user =
        User.builder()
            .username(upsertUserRequest.getUsername().trim())
            .email(email)
            .password(passwordEncoded)
//            .emailVerified(false)
            .build();

    Role userRole =
        this.roleService
            .findByRoleName(RoleEnum.ROLE_USER)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.ROLE_NOT_FOUND));
    user.addRole(userRole);

    // Deferred verification: account is usable immediately after sign-up.
    // Verification OTP is requested only when the user enters a protected business flow
    // such as booking a chef / checkout.
    this.userService.save(user);

    return BaseResponse.ok();
  }

  @Override
  @Transactional
  public BaseResponse<Void> verifyEmail(VerifyEmailRequest verifyEmailRequest) {
    String email = normalizeEmail(verifyEmailRequest.getEmail());
    User user =
        userService
            .findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));

//    if (user.isEmailVerified()) return BaseResponse.ok();

    String otpKey = String.format(EmailVerificationKey.OTP_KEY.getContent(), email);
    Object cachedOtp = cacheService.retrieve(otpKey);

    if (cachedOtp == null) throw new OTPTimeOutException(ErrorCode.OTP_TIMEOUT);
    if (!String.valueOf(cachedOtp).equals(verifyEmailRequest.getOtp())) {
      throw new PermissionDeniedException(ErrorCode.NOT_MATCHED_OTP);
    }

//    user.verifyEmail();
    userService.save(user);

    cacheService.delete(otpKey);
    cacheService.delete(String.format(EmailVerificationKey.RETRY_KEY.getContent(), email));

    return BaseResponse.ok();
  }

  @Override
  public BaseResponse<Void> resendVerification(
      ResendVerificationRequest resendVerificationRequest) {
    String email = normalizeEmail(resendVerificationRequest.getEmail());
    User user =
        userService
            .findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));

//    if (user.isEmailVerified()) {
//      throw new PermissionDeniedException(ErrorCode.EMAIL_ALREADY_VERIFIED);
//    }

    sendEmailVerificationCode(user, true);
    return BaseResponse.ok();
  }

  @Override
  public BaseResponse<RefreshTokenResponse> refreshToken(RefreshTokenRequest refreshTokenRequest) {
    String email = this.jwtService.getEmailFromJwtToken(refreshTokenRequest.getRefreshToken());
    String refreshTokenKey = String.format(TokenType.REFRESH_TOKEN.getCacheKeyTemplate(), email);

    boolean isInvalidRefreshToken = !this.cacheService.hasKey(refreshTokenKey);
    if (isInvalidRefreshToken) throw new PermissionDeniedException(ErrorCode.JWT_INVALID);

    String accessToken = this.jwtService.generateAccessToken(email);

    RefreshTokenResponse refreshTokenResponse =
        RefreshTokenResponse.builder().accessToken(accessToken).build();
    return BaseResponse.build(refreshTokenResponse, true);
  }

  @Override
  public BaseResponse<Void> logout() {
    SecurityUserDetails principal =
        (SecurityUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

    String accessTokenCacheKey =
        String.format(TokenType.ACCESS_TOKEN.getCacheKeyTemplate(), principal.getUsername());
    String refreshTokenCacheKey =
        String.format(TokenType.REFRESH_TOKEN.getCacheKeyTemplate(), principal.getUsername());

    cacheService.delete(accessTokenCacheKey);
    cacheService.delete(refreshTokenCacheKey);

    SecurityContextHolder.clearContext();
    return BaseResponse.ok();
  }

  @Override
  @Transactional
  public BaseResponse<Void> resetPassword(ResetPasswordRequest resetPasswordRequest) {
    boolean isValidPassword =
        resetPasswordRequest.getNewPassword().equals(resetPasswordRequest.getConfirmPassword());
    if (!isValidPassword) throw new PermissionDeniedException(ErrorCode.NOT_MATCHED_PASSWORD);

    String resetPasswordToken = resetPasswordRequest.getResetPasswordToken();
    if (!jwtService.validateToken(resetPasswordToken)) {
      throw new InvalidTokenException(ErrorCode.JWT_INVALID);
    }

    String email = normalizeEmail(jwtService.getEmailFromJwtToken(resetPasswordToken));
    String resetTokenKey = String.format(ResetPasswordKey.RESET_TOKEN_KEY.getContent(), email);
    Object cachedResetToken = cacheService.retrieve(resetTokenKey);

    if (cachedResetToken == null || !String.valueOf(cachedResetToken).equals(resetPasswordToken)) {
      throw new InvalidTokenException(ErrorCode.JWT_INVALID);
    }

    User user =
        userService
            .findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));

    String newPasswordEncoded = passwordEncoder.encode(resetPasswordRequest.getNewPassword());
    user.changePassword(newPasswordEncoded);
    userService.save(user);

    cacheService.delete(resetTokenKey);
    cacheService.delete(String.format(ResetPasswordKey.OTP_KEY.getContent(), email));
    cacheService.delete(String.format(ResetPasswordKey.TIMEOUT_RETRY_KEY.getContent(), email));
    cacheService.delete(String.format(TokenType.ACCESS_TOKEN.getCacheKeyTemplate(), email));
    cacheService.delete(String.format(TokenType.REFRESH_TOKEN.getCacheKeyTemplate(), email));

    return BaseResponse.ok();
  }

  @Override
  public BaseResponse<ForgotPasswordResponse> forgotPassword(
      ForgotPasswordRequest forgotPasswordRequest) {
    String email = normalizeEmail(forgotPasswordRequest.getEmail());
    User user =
        userService
            .findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));

    // Password recovery is allowed even when e-mail has not been verified yet.
    // The reset OTP itself proves that the user can receive mail at this address.
    String timeOutRetryKey =
        String.format(ResetPasswordKey.TIMEOUT_RETRY_KEY.getContent(), email);
    if (cacheService.hasKey(timeOutRetryKey)) {
      throw new SpamForgotPasswordException(ErrorCode.SPAM_FORGOT_PASSWORD);
    }

    cacheService.delete(String.format(ResetPasswordKey.RESET_TOKEN_KEY.getContent(), email));

    String otp = OTPGeneratorUtil.generaRandomCode();
    MessageMailDTO messageMailDTO = MailUtil.buildMessageMailDTOForOTP(email, otp);
    String otpKey = String.format(ResetPasswordKey.OTP_KEY.getContent(), email);

    cacheService.store(otpKey, otp, OTP_TTL_MINUTES, TimeUnit.MINUTES);
    cacheService.store(
        timeOutRetryKey, email, OTP_RESEND_COOLDOWN_SECONDS, TimeUnit.SECONDS);
    mailProducerService.send(messageMailDTO);

    return BaseResponse.build(ForgotPasswordResponse.builder().build(), true);
  }

  @Override
  public BaseResponse<VerifyOTPResponse> verify(VerifyOTPRequest verifyOTPRequest) {
    String email = normalizeEmail(verifyOTPRequest.getEmail());
    User user =
        userService
            .findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));

    String otpKey = String.format(ResetPasswordKey.OTP_KEY.getContent(), user.getEmail());
    Object cachedOtp = cacheService.retrieve(otpKey);

    if (cachedOtp == null) throw new OTPTimeOutException(ErrorCode.OTP_TIMEOUT);
    if (!String.valueOf(cachedOtp).equals(verifyOTPRequest.getOtp())) {
      throw new PermissionDeniedException(ErrorCode.NOT_MATCHED_OTP);
    }

    String resetPasswordToken = jwtService.generateResetPasswordToken(user.getEmail());
    String resetTokenKey =
        String.format(ResetPasswordKey.RESET_TOKEN_KEY.getContent(), user.getEmail());

    cacheService.store(
        resetTokenKey, resetPasswordToken, RESET_TOKEN_TTL_MINUTES, TimeUnit.MINUTES);
    cacheService.delete(otpKey);

    return BaseResponse.build(
        VerifyOTPResponse.builder().resetPasswordToken(resetPasswordToken).build(), true);
  }

  @Override
  @Transactional(readOnly = true)
  public BaseResponse<UserDetailResponse> findProfile() {
    SecurityUserDetails principal =
        (SecurityUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    Optional<ChefProfileDTO> chefProfileOpt = this.chefProfileService.findChefProfileByUserId(principal.getId());
    UserDetailResponse userDetailResponse =
        UserDetailResponse.builder()
            .id(principal.getId())
            .username(principal.getUsername())
            .email(principal.getEmail())
            .avatarUrl(principal.getAvatarUrl())
            .isChef(principal.isChef())
                .chefProfile(chefProfileOpt.get())
            .roles(
                principal.getAuthorities().stream()
                    .map(authority -> authority.getAuthority().toString())
                    .toList())
            .build();
    return BaseResponse.build(userDetailResponse, true);
  }

  @Override
  @Transactional(readOnly = true)
  public BaseResponse<UserDetailResponse> findDetailById(Long id) {
    User user =
        userService
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));

    UserDetailResponse userDetailResponse =
        UserDetailResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
//            .emailVerified(user.isEmailVerified())
            .avatarUrl(user.getAvatarUrl())
            .build();
    return BaseResponse.build(userDetailResponse, true);
  }

  @Override
  @Transactional
  public BaseResponse<String> uploadFile(byte[] bytes) {
    SecurityUserDetails principal =
        (SecurityUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    User user =
        userService
            .findByEmail(principal.getUsername())
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));
    String avatarUrl = this.cloudinaryService.uploadFile(bytes, FileType.IMAGE);
    user.addAvatarUrl(avatarUrl);
    return BaseResponse.build(avatarUrl, true);
  }

  @Override
  @Transactional
  public BaseResponse<Void> updateProfile(UpdateUserProfileRequest updateUserProfileRequest) {
    SecurityUserDetails principal =
        (SecurityUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    User user =
        userService
            .findByEmail(principal.getUsername())
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.USER_NOT_FOUND));
    user.changeUsername(updateUserProfileRequest.getUsername());

    this.userService.save(user);
    return BaseResponse.ok();
  }

  private void sendEmailVerificationCode(User user, boolean enforceCooldown) {
    String email = normalizeEmail(user.getEmail());
    String retryKey = String.format(EmailVerificationKey.RETRY_KEY.getContent(), email);

    if (enforceCooldown && cacheService.hasKey(retryKey)) {
      throw new PermissionDeniedException(ErrorCode.SPAM_EMAIL_VERIFICATION);
    }

    String otp = OTPGeneratorUtil.generaRandomCode();
    String otpKey = String.format(EmailVerificationKey.OTP_KEY.getContent(), email);

    cacheService.store(otpKey, otp, OTP_TTL_MINUTES, TimeUnit.MINUTES);
    cacheService.store(
        retryKey, email, OTP_RESEND_COOLDOWN_SECONDS, TimeUnit.SECONDS);
    mailProducerService.send(MailUtil.buildMessageMailDTOForEmailVerification(email, otp));
  }

  private String normalizeEmail(String email) {
    return email.trim().toLowerCase(Locale.ROOT);
  }
}
