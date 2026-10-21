package com.james.LMS.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
  USER_NOT_FOUND("1000", "User not found exception"),
  PERMISSION_DENIES("1001", "Permission denied exception"),
  ROLE_NOT_FOUND("1002", "Role not found"),
  JWT_INVALID("1003", "Jwt invalid"),
  NOT_MATCHED_PASSWORD("1004", "Password doesn't match"),
  USER_ALREADY_EXISTS("1005", "User already exists"),
  SPAM_FORGOT_PASSWORD("1006", "Spam forgot password"),
  OTP_TIMEOUT("1007", "OTP timeout"),
  NOT_MATCHED_OTP("1008", "OPT doesn't match"),
  INSTRUCTOR_ALREADY_EXISTS("1009", "Instructor already exists"),
  FILE_ERROR_UPLOAD("1010", "Upload error"),
  COMPANY_ADMIN_ROLE_ALREADY_EXISTS("1011", "Company role already exists"),
  INVALID_CREDENTIALS("1012", "Email or password is incorrect"),
  EMAIL_NOT_VERIFIED("1013", "Email has not been verified"),
  EMAIL_ALREADY_VERIFIED("1014", "Email has already been verified"),
  SPAM_EMAIL_VERIFICATION("1015", "Please wait before requesting another verification code"),
  NOT_MATCHED_PASSWORD_OR_EMAIL("1016", "Email or password dont match"),
  USER_WAS_CHEF("1017", "User was the chef of the system"),
  PROVINCE_NOT_FOUND("1018","Province not found" ),
  WARD_NOT_FOUND("1019","Ward not found"), LOCATION_INVALID("1020","Location is invalid" );

  private final String code;
  private final String message;
}
