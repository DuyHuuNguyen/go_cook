package com.james.LMS.payment;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.james.LMS.config.VnpayProperties;
import com.james.LMS.service.VnpayGateway;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

class VnpayGatewayTest {
  @Test
  void generatedUrlHasValidSignatureAndDetectsTampering() {
    VnpayProperties properties = new VnpayProperties();
    properties.setTmnCode("TESTCODE");
    properties.setHashSecret("test-secret");
    properties.setPayUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
    properties.setReturnUrl("http://localhost:8083/api/v1/payments/vnpay/return");
    VnpayGateway gateway = new VnpayGateway(properties);
    OffsetDateTime created = OffsetDateTime.of(2026, 11, 11, 3, 0, 0, 0, ZoneOffset.UTC);

    String url =
        gateway.paymentUrl(
            "ref123",
            new BigDecimal("10000.00"),
            "Booking BK-123",
            "127.0.0.1",
            created,
            created.plusMinutes(15));
    Map<String, String> parameters =
        Arrays.stream(URI.create(url).getRawQuery().split("&"))
            .map(pair -> pair.split("=", 2))
            .collect(Collectors.toMap(pair -> decode(pair[0]), pair -> decode(pair[1])));

    assertTrue(gateway.validSignature(parameters));
    assertTrue(gateway.validMerchant(parameters));
    assertTrue(url.contains("vnp_Amount=1000000"));
    assertTrue(url.contains("vnp_CreateDate=20261111100000"));
    parameters.put("vnp_Amount", "2000000");
    assertFalse(gateway.validSignature(parameters));
  }

  private static String decode(String value) {
    return URLDecoder.decode(value, StandardCharsets.UTF_8);
  }
}
