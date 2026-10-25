package com.example.server.controller;

import com.example.server.dto.common.ApiResponse;
import com.example.server.dto.user.CreateUserRequest;
import com.example.server.dto.user.UserResponse;
import com.example.server.entity.UserEntity;
import com.example.server.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller quản lý Người dùng hệ thống kế thừa 5 API CRUD chuẩn từ BaseController.
 */
@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Users", description = "Quản lý tài khoản người dùng và phân quyền (Dành riêng cho ADMIN)")
public class UserController extends BaseController<UserEntity, Long, CreateUserRequest, UserResponse, UserService> {

    public UserController(UserService service) {
        super(service);
    }

    @GetMapping("/username/{username}")
    @Operation(summary = "Tra cứu người dùng theo tên đăng nhập")
    public ResponseEntity<ApiResponse<UserResponse>> getByUsername(@PathVariable String username) {
        return ResponseEntity.ok(ApiResponse.success(service.findByUsername(username)));
    }
}
