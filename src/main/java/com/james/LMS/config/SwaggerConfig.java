package com.james.LMS.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(servers = {@Server(url = "/")})
public class SwaggerConfig {
  @Bean
  public GroupedOpenApi openApi() {
    String[] paths = {"/api/**"};
    return GroupedOpenApi.builder()
        .group("demos-service")
        .packagesToScan("com.james.LMS.controller")
        .pathsToMatch(paths)
        .build();
  }
}
