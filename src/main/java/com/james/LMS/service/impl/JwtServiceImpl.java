package com.james.LMS.service.impl;

import com.james.LMS.enums.ErrorCode;
import com.james.LMS.exception.InvalidTokenException;
import com.james.LMS.service.JwtService;
import io.jsonwebtoken.*;
import java.util.Date;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {
  @Value("${jwt.secretKey}")
  private String SECRET_KEY;

  @Value("${jwt.accessTokenExpirationTime}")
  private String ACCESS_TOKEN_EXPIRATION_TIME;

  @Value("${jwt.refreshTokenExpirationTime}")
  private String REFRESH_TOKEN_EXPIRATION_TIME;

  @Value("${jwt.resetPasswordTokenExpirationTime}")
  private String RESET_PASSWORD_TOKEN_EXPIRATION_TIME;

  @Override
  public String generateAccessToken(String email) {
    return Jwts.builder()
        .setId(UUID.randomUUID().toString())
        .setSubject(email)
        .setIssuedAt(new Date())
        .setExpiration(
            new Date(System.currentTimeMillis() + Long.parseLong(ACCESS_TOKEN_EXPIRATION_TIME)))
        .signWith(SignatureAlgorithm.HS512, SECRET_KEY)
        .compact();
  }

  @Override
  public String generateRefreshToken(String email) {
    return Jwts.builder()
        .setId(UUID.randomUUID().toString())
        .setSubject(email)
        .setIssuedAt(new Date())
        .setExpiration(
            new Date(System.currentTimeMillis() + Long.parseLong(REFRESH_TOKEN_EXPIRATION_TIME)))
        .signWith(SignatureAlgorithm.HS512, SECRET_KEY)
        .compact();
  }

  @Override
  public String generateResetPasswordToken(String email) {
    return Jwts.builder()
        .setId(UUID.randomUUID().toString())
        .setSubject(email)
        .setIssuedAt(new Date())
        .setExpiration(
            new Date(
                System.currentTimeMillis() + Long.parseLong(RESET_PASSWORD_TOKEN_EXPIRATION_TIME)))
        .signWith(SignatureAlgorithm.HS512, SECRET_KEY)
        .compact();
  }

  @Override
  public Boolean validateToken(String token) {
    if (null == token) return false;
    try {
      Jwts.parserBuilder().setSigningKey(SECRET_KEY).build().parse(token);
    } catch (MalformedJwtException
        | ExpiredJwtException
        | UnsupportedJwtException
        | IllegalArgumentException
        | SignatureException exception) {
      throw new InvalidTokenException(ErrorCode.JWT_INVALID);
    }
    return true;
  }

  @Override
  public String getEmailFromJwtToken(String token) {
    try {
      return Jwts.parser()
          .setSigningKey(SECRET_KEY)
          .parseClaimsJws(token)
          .getBody()
          .get("sub", String.class);
    } catch (Exception e) {
      throw new InvalidTokenException(ErrorCode.JWT_INVALID);
    }
  }
}
