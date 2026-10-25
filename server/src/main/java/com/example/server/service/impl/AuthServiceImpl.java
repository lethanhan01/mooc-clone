package com.example.server.service.impl;

import com.example.server.dto.auth.AuthResponse;
import com.example.server.dto.auth.LoginRequest;
import com.example.server.dto.auth.RegisterRequest;
import com.example.server.dto.auth.UserProfileResponse;
import com.example.server.entity.SessionEntity;
import com.example.server.entity.UserEntity;
import com.example.server.entity.enums.SystemRole;
import com.example.server.entity.enums.UserStatus;
import com.example.server.exception.AppException;
import com.example.server.exception.ErrorCode;
import com.example.server.repository.SessionRepository;
import com.example.server.repository.UserRepository;
import com.example.server.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthServiceImpl(UserRepository userRepository,
                           SessionRepository sessionRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserProfileResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new AppException(ErrorCode.USER_EXISTED, "Tên tài khoản đã tồn tại: " + request.username());
        }

        UserEntity user = new UserEntity(
                request.username(),
                request.email(),
                passwordEncoder.encode(request.password()),
                request.displayName(),
                SystemRole.USER
        );
        UserEntity saved = userRepository.save(user);

        return new UserProfileResponse(
                saved.getId(),
                saved.getUsername(),
                saved.getEmail(),
                saved.getDisplayName(),
                saved.getSystemRole().name(),
                saved.getStatus().name(),
                saved.getCreatedAt()
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByUsername(request.usernameOrEmail())
                .or(() -> userRepository.findByEmail(request.usernameOrEmail()))
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED, "Tài khoản hoặc mật khẩu không chính xác"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Tài khoản hiện đang bị khóa");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED, "Tài khoản hoặc mật khẩu không chính xác");
        }

        // Tạo raw token ngẫu nhiên
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        // Băm SHA-256 để lưu trữ vào bảng sessions 3NF (32 bytes binary)
        byte[] tokenHash = sha256(rawToken);

        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime expiresAt = now.plusDays(7); // Phiên làm việc 7 ngày

        SessionEntity session = new SessionEntity(user, tokenHash, expiresAt);
        sessionRepository.save(session);

        return new AuthResponse(
                rawToken,
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getSystemRole().name(),
                expiresAt
        );
    }

    @Override
    public void logout(String rawToken) {
        byte[] tokenHash = sha256(rawToken);
        sessionRepository.findByTokenHashAndRevokedAtIsNull(tokenHash).ifPresent(session -> {
            session.setRevokedAt(OffsetDateTime.now());
            sessionRepository.save(session);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getMe(String rawToken) {
        byte[] tokenHash = sha256(rawToken);
        SessionEntity session = sessionRepository.findByTokenHashAndRevokedAtIsNull(tokenHash)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"));

        if (session.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED, "Phiên đăng nhập đã hết hạn");
        }

        UserEntity user = session.getUser();
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                user.getSystemRole().name(),
                user.getStatus().name(),
                user.getCreatedAt()
        );
    }

    private byte[] sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return digest.digest(input.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
