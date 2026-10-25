package com.example.server.dto.user;

import com.example.server.entity.enums.SystemRole;
import com.example.server.entity.enums.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(max = 100, message = "Tên hiển thị tối đa 100 ký tự")
        String displayName,

        @Email(message = "Email không đúng định dạng")
        String email,

        @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự nếu thay đổi")
        String password,

        SystemRole systemRole,
        UserStatus status
) {}
