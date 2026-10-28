package com.james.LMS.controller;

import com.james.LMS.facade.AdminMenuFacade;
import com.james.LMS.request.AdminMenuStatusRequest;
import com.james.LMS.request.AdminMenuUpdateRequest;
import com.james.LMS.request.MenuSearchRequest;
import com.james.LMS.response.AdminMenuResponse;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/menus")
@PreAuthorize("hasAuthority('ROLE_SYSTEM_ADMIN')")
public class AdminMenuController {
    private final AdminMenuFacade facade;

    @GetMapping
    public BaseResponse<PaginationResponse<AdminMenuResponse>> list(
            @Valid @ParameterObject MenuSearchRequest request,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean isActive) {
        return facade.list(request, status, isActive);
    }

    @GetMapping("/{id}")
    public BaseResponse<AdminMenuResponse> detail(@PathVariable Long id) {
        return facade.detail(id);
    }

    @PutMapping("/{id}")
    public BaseResponse<AdminMenuResponse> update(
            @PathVariable Long id, @Valid @RequestBody AdminMenuUpdateRequest request) {
        return facade.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public BaseResponse<AdminMenuResponse> updateStatus(
            @PathVariable Long id, @Valid @RequestBody AdminMenuStatusRequest request) {
        return facade.updateStatus(id, request);
    }
}
