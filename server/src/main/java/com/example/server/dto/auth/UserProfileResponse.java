package com.example.server.dto.auth;

import java.time.OffsetDateTime;

public record UserProfileResponse(
        Long id,
        String username,
        String email,
        String displayName,
        String role,
        String status,
        OffsetDateTime createdAt
) {}
