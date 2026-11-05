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
  PROVINCE_NOT_FOUND("1018", "Province not found"),
  WARD_NOT_FOUND("1019", "Ward not found"),
  LOCATION_INVALID("1020", "Location is invalid"),
  MENU_NOT_FOUND("1021", "Menu not found"),
  CATEGORY_NOT_FOUND("1022", "Category not found"),
  CHEF_PROFILE_NOT_FOUND("1023", "Chef application not found"),
  BOOKING_NOT_FOUND("1024", "Booking not found"),
  DISH_NOT_FOUND("1025", "One or more dishes were not found"),
  CONVERSATION_NOT_FOUND("1026", "Conversation not found"),
  CONVERSATION_ACCESS_DENIED("1027", "You are not authorized to access this conversation"),
  BOOKING_CONVERSATION_MISMATCH("1028", "Booking does not belong to this conversation"),
  BOOKING_PRICE_OFFER_NOT_FOUND("1029", "Booking price offer not found"),
  ONLY_RECEIVER_CAN_ACCEPT_OFFER("1030", "Only the receiver can accept this offer"),
  ONLY_RECEIVER_CAN_REJECT_OFFER("1033", "Only the receiver can reject this offer"),
  OFFER_ALREADY_PROCESSED("1031", "This offer has already been processed"),
  MESSAGE_NOT_FOUND("1032", "Message not found");

  private final String code;
  private final String message;
}
