package com.james.LMS.service;

import com.james.LMS.config.VnpayProperties;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class VnpayGateway {
  private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
  private static final DateTimeFormatter DATE_FORMAT =
      DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
  private final VnpayProperties properties;

  public String paymentUrl(
      String transactionRef,
      BigDecimal amount,
      String orderInfo,
      String ipAddress,
      OffsetDateTime createdAt,
      OffsetDateTime expiresAt) {
    requireConfiguration();
    TreeMap<String, String> parameters = new TreeMap<>();
    parameters.put("vnp_Version", "2.1.0");
    parameters.put("vnp_Command", "pay");
    parameters.put("vnp_TmnCode", properties.getTmnCode());
    parameters.put("vnp_Amount", amount.movePointRight(2).toBigIntegerExact().toString());
    parameters.put("vnp_CurrCode", "VND");
    parameters.put("vnp_TxnRef", transactionRef);
    parameters.put("vnp_OrderInfo", orderInfo);
    parameters.put("vnp_OrderType", "other");
    parameters.put("vnp_Locale", "vn");
    parameters.put("vnp_ReturnUrl", properties.getReturnUrl());
    parameters.put("vnp_IpAddr", ipAddress);
    parameters.put("vnp_CreateDate", createdAt.atZoneSameInstant(VIETNAM_ZONE).format(DATE_FORMAT));
    parameters.put("vnp_ExpireDate", expiresAt.atZoneSameInstant(VIETNAM_ZONE).format(DATE_FORMAT));
    String query = encode(parameters);
    String delimiter = properties.getPayUrl().contains("?") ? "&" : "?";
    return properties.getPayUrl() + delimiter + query + "&vnp_SecureHash=" + sign(query);
  }

  public boolean validSignature(Map<String, String> callback) {
    requireConfiguration();
    String receivedHash = callback.get("vnp_SecureHash");
    if (receivedHash == null || !receivedHash.matches("(?i)[0-9a-f]{128}")) return false;
    TreeMap<String, String> signed = new TreeMap<>();
    callback.forEach(
        (key, value) -> {
          if (key.startsWith("vnp_")
              && !key.equals("vnp_SecureHash")
              && !key.equals("vnp_SecureHashType")
              && value != null
              && !value.isEmpty()) {
            signed.put(key, value);
          }
        });
    byte[] expected = java.util.HexFormat.of().parseHex(sign(encode(signed)));
    byte[] actual = java.util.HexFormat.of().parseHex(receivedHash);
    return java.security.MessageDigest.isEqual(expected, actual);
  }

  public boolean validMerchant(Map<String, String> callback) {
    return properties.getTmnCode() != null
        && properties.getTmnCode().equals(callback.get("vnp_TmnCode"));
  }

  private void requireConfiguration() {
    if (blank(properties.getTmnCode())
        || blank(properties.getHashSecret())
        || blank(properties.getPayUrl())
        || blank(properties.getReturnUrl())) {
      throw new IllegalStateException("VNPay configuration is incomplete");
    }
  }

  private static boolean blank(String value) {
    return value == null || value.isBlank();
  }

  private String sign(String data) {
    try {
      Mac mac = Mac.getInstance("HmacSHA512");
      mac.init(
          new SecretKeySpec(
              properties.getHashSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
      return java.util.HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException | InvalidKeyException e) {
      throw new IllegalStateException("Cannot sign VNPay request", e);
    }
  }

  private static String encode(Map<String, String> parameters) {
    StringBuilder result = new StringBuilder();
    parameters.forEach(
        (key, value) -> {
          if (value == null || value.isEmpty()) return;
          if (!result.isEmpty()) result.append('&');
          result
              .append(URLEncoder.encode(key, StandardCharsets.UTF_8))
              .append('=')
              .append(URLEncoder.encode(value, StandardCharsets.UTF_8));
        });
    return result.toString();
  }
}
