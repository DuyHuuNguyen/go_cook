package com.james.LMS.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthSchemaInitializer implements ApplicationRunner {
  private final JdbcTemplate jdbcTemplate;

  @Override
  public void run(ApplicationArguments args) {
    jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN");
    jdbcTemplate.execute("UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL");
    jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT FALSE");
    jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN email_verified SET NOT NULL");
  }
}
