package com.example.server.dto.user;

import com.example.server.entity.enums.SystemRole;
import com.example.server.entity.enums.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdateUserRequest(
        @Email(message = "Email không hợp lệ")
        String email,

        @NotBlank(message = "Tên hiển thị không được để trống")
        String displayName,

        String password,
        SystemRole systemRole,
        UserStatus status
) {}
