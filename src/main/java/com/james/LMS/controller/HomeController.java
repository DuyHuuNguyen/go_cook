package com.james.LMS.controller;

import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.HomeResponse;
import com.james.LMS.service.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/home")
@RequiredArgsConstructor
public class HomeController {
  private final HomeService homeService;

  @GetMapping
  public BaseResponse<HomeResponse> getHome() {
    return BaseResponse.build(homeService.getHome(), true);
  }
}
