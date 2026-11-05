package com.james.LMS.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateBookingChefRequest(@NotNull @Positive Long chefId) {}
