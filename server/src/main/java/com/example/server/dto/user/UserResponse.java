package com.example.server.dto.user;

import java.time.OffsetDateTime;

public record UserResponse(
        Long id,
        String username,
        String email,
        String displayName,
        String systemRole,
        String status,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
