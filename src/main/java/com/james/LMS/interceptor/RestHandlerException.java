package com.james.LMS.interceptor;

import com.james.LMS.exception.*;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ExceptionResponse;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class RestHandlerException {

  @ExceptionHandler(EntityNotFoundException.class)
  public ResponseEntity<BaseResponse<ExceptionResponse>> handleEntityNotFoundException(
      EntityNotFoundException exception) {
    return new ResponseEntity<>(
        BaseResponse.build(
            new ExceptionResponse(exception.getErrorCode(), exception.getMessage()), false),
        HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(PermissionDeniedException.class)
  public ResponseEntity<BaseResponse<ExceptionResponse>> handlePermissionDeniedException(
      PermissionDeniedException exception) {
    return new ResponseEntity<>(
        BaseResponse.build(
            new ExceptionResponse(exception.getErrorCode(), exception.getMessage()), false),
        HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(InvalidTokenException.class)
  public ResponseEntity<BaseResponse<ExceptionResponse>> handleInvalidTokenException(
      InvalidTokenException exception) {
    return new ResponseEntity<>(
        BaseResponse.build(
            new ExceptionResponse(exception.getErrorCode(), exception.getMessage()), false),
        HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(InvalidOTPException.class)
  public ResponseEntity<BaseResponse<ExceptionResponse>> handleInvalidOTPException(
      InvalidOTPException exception) {
    return new ResponseEntity<>(
        BaseResponse.build(
            new ExceptionResponse(exception.getErrorCode(), exception.getMessage()), false),
        HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(UserAlreadyExistException.class)
  public ResponseEntity<BaseResponse<ExceptionResponse>> userAlreadyException(
      UserAlreadyExistException exception) {
    return new ResponseEntity<>(
        BaseResponse.build(
            new ExceptionResponse(exception.getErrorCode(), exception.getMessage()), false),
        HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(SpamForgotPasswordException.class)
  public ResponseEntity<BaseResponse<ExceptionResponse>> spamForgotPasswordException(
      SpamForgotPasswordException exception) {
    return new ResponseEntity<>(
        BaseResponse.build(
            new ExceptionResponse(exception.getErrorCode(), exception.getMessage()), false),
        HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(OTPTimeOutException.class)
  public ResponseEntity<BaseResponse<ExceptionResponse>> OTPTimeOutException(
      OTPTimeOutException exception) {
    return new ResponseEntity<>(
        BaseResponse.build(
            new ExceptionResponse(exception.getErrorCode(), exception.getMessage()), false),
        HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<BaseResponse<ExceptionResponse>> handleBadCredentials(
      BadCredentialsException exception) {
    return new ResponseEntity<>(
        BaseResponse.build(
            new ExceptionResponse(
                com.james.LMS.enums.ErrorCode.INVALID_CREDENTIALS.getCode(),
                com.james.LMS.enums.ErrorCode.INVALID_CREDENTIALS.getMessage()),
            false),
        HttpStatus.UNAUTHORIZED);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {

    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult()
        .getFieldErrors()
        .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));

    return new ResponseEntity<>(BaseResponse.build(errors, false), HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<BaseResponse<ExceptionResponse>> handleIllegalArgument(
      IllegalArgumentException exception) {
    return new ResponseEntity<>(
        BaseResponse.build(
            new ExceptionResponse("ADMIN_VALIDATION", exception.getMessage()), false),
        HttpStatus.BAD_REQUEST);
  }
}
