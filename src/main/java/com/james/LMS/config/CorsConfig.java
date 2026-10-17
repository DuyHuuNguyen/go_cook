package com.james.LMS.config;

import java.util.Arrays;
import java.util.List;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Slf4j
@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        log.info("Create cors config");
        CorsConfiguration config = new CorsConfiguration();

        boolean isSpecificOrigins = !allowedOrigins.trim().equals("*");

        List<String> originList = isSpecificOrigins
                ? Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList()
                : List.of("*");

        config.setAllowedOrigins(originList);
        config.setAllowCredentials(isSpecificOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "Set-Cookie"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        logAllowedOrigin(originList, isSpecificOrigins);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    private void logAllowedOrigin(List<String> origins, boolean withCredentials) {
        log.info("########################-START-CORS-CONFIG-#########################");
        log.info("Origin list: ");
        origins.forEach(log::info);
        log.info("with Credentials: {}", withCredentials);
        log.info("########################-END-CORS-CONFIG-###########################");
    }
}