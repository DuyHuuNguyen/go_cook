package com.james.LMS.response;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class BaseResponse<T> {
  private boolean isSuccess;
  private T data;

  public static <T> BaseResponse<T> build(T data, boolean isSuccess) {
    return (BaseResponse<T>) BaseResponse.builder().isSuccess(isSuccess).data(data).build();
  }

  public static <T> BaseResponse<T> ok() {
    return (BaseResponse<T>) BaseResponse.builder().isSuccess(true).data("Success").build();
  }
}
