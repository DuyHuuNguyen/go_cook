package com.james.LMS.response;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@ToString
@Builder
public class WardResponse {
    private String fullName;
    private String code;
}
