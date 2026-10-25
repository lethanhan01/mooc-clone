package com.example.server.dto.auth;

import java.time.OffsetDateTime;

public record AuthResponse(
        String token,
        Long userId,
        String username,
        String displayName,
        String role,
        OffsetDateTime expiresAt
) {}
