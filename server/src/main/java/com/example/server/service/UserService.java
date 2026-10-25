package com.example.server.service;

import com.example.server.dto.user.CreateUserRequest;
import com.example.server.dto.user.UserResponse;
import com.example.server.entity.UserEntity;

public interface UserService extends BaseService<UserEntity, Long, CreateUserRequest, UserResponse> {
    UserResponse findByUsername(String username);
}
