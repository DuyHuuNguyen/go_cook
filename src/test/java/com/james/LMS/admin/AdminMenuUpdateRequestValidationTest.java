package com.james.LMS.admin;

import com.james.LMS.request.AdminMenuUpdateRequest;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AdminMenuUpdateRequestValidationTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void acceptsValidMenuChanges() {
        var request = new AdminMenuUpdateRequest("Mâm cơm gia đình", "Mô tả", 1L,
                new BigDecimal("239000"), 2, 5);
        assertTrue(validator.validate(request).isEmpty());
    }

    @Test
    void rejectsInvalidPriceAndGuestRange() {
        var request = new AdminMenuUpdateRequest(" ", "", 0L,
                new BigDecimal("-1"), 6, 2);
        assertFalse(validator.validate(request).isEmpty());
    }
}
