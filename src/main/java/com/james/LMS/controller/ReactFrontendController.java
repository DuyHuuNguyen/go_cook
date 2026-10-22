package com.james.LMS.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ReactFrontendController {
  @GetMapping({"/app", "/app/", "/app/{route:[a-zA-Z0-9-]+}", "/app/seller/{route:[a-zA-Z0-9-]+}"})
  public String application() {
    return "forward:/app/index.html";
  }
}
