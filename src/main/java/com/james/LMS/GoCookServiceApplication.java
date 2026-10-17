package com.james.LMS;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@RequiredArgsConstructor
@SpringBootApplication
public class GoCookServiceApplication {

  private final PasswordEncoder passwordEncoder;

  @PostConstruct
  void showPassword() {
    String passwordOfSystemAdmin = "systemadmin";
    String passEncoded = this.passwordEncoder.encode(passwordOfSystemAdmin);
    log.info("## pass systemadmin {}", passEncoded);
  }

  public static void main(String[] args) {
    SpringApplication.run(GoCookServiceApplication.class, args);
  }
}
