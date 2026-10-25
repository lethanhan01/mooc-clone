package com.example.server.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "Tên đăng nhập hoặc email không được để trống")
        @Size(max = 254, message = "Định danh đăng nhập không vượt quá 254 ký tự")
        String usernameOrEmail,

        @NotBlank(message = "Mật khẩu không được để trống")
        String password
) {}
