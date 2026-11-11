package com.example.server.security;

import com.example.server.entity.UserEntity;

import java.util.Optional;

public final class SecurityUtil {

    private static final ThreadLocal<UserEntity> CURRENT_USER = new ThreadLocal<>();

    private SecurityUtil() {}

    public static void setCurrentUser(UserEntity user) {
        CURRENT_USER.set(user);
    }

    public static void clear() {
        CURRENT_USER.remove();
    }

    public static Optional<UserEntity> getCurrentUser() {
        return Optional.ofNullable(CURRENT_USER.get());
    }

    public static Optional<Long> getCurrentUserId() {
        return getCurrentUser().map(UserEntity::getId);
    }

    public static Optional<String> getCurrentUsername() {
        return getCurrentUser().map(UserEntity::getUsername);
    }
}
