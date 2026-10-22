package com.james.LMS.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontendController {

  @GetMapping("/")
  public String root() {
    return "redirect:/app/";
  }

  @GetMapping({"/app", "/app/", "/app/{route:[a-zA-Z0-9-]+}"})
  public String singlePageApp() {
    return "forward:/app/index.html";
  }
}
