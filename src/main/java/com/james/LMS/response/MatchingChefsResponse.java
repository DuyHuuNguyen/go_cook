package com.james.LMS.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record MatchingChefsResponse(
    @JsonProperty("isSuccess") boolean isSuccess,
    List<MatchingChefResponse> data) {}
