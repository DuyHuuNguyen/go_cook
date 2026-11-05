package com.james.LMS.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BookingRequestException extends RuntimeException {
  private final HttpStatus status;
  private final String errorCode;

  public BookingRequestException(HttpStatus status, String errorCode, String message) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
  }
}
