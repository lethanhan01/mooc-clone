package com.example.server.service;

import com.example.server.dto.auth.AuthResponse;
import com.example.server.dto.auth.LoginRequest;
import com.example.server.dto.auth.RegisterRequest;
import com.example.server.dto.auth.UserProfileResponse;

public interface AuthService {
    UserProfileResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void logout(String token);
    UserProfileResponse getMe(String token);
}
