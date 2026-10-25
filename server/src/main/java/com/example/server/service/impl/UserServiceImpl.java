package com.example.server.service.impl;

import com.example.server.dto.user.CreateUserRequest;
import com.example.server.dto.user.UserResponse;
import com.example.server.entity.UserEntity;
import com.example.server.entity.enums.SystemRole;
import com.example.server.entity.enums.UserStatus;
import com.example.server.exception.AppException;
import com.example.server.exception.ErrorCode;
import com.example.server.repository.UserRepository;
import com.example.server.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserServiceImpl extends BaseServiceImpl<UserEntity, Long, CreateUserRequest, UserResponse, UserRepository>
        implements UserService {

    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository repository, PasswordEncoder passwordEncoder) {
        super(repository);
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findByUsername(String username) {
        return repository.findByUsername(username)
                .map(this::toResponseDto)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED, "Không tìm thấy người dùng: " + username));
    }

    @Override
    protected UserEntity toEntity(CreateUserRequest request) {
        if (repository.existsByUsername(request.username())) {
            throw new AppException(ErrorCode.USER_EXISTED, "Tên người dùng đã tồn tại: " + request.username());
        }
        UserEntity entity = new UserEntity();
        entity.setUsername(request.username());
        entity.setEmail(request.email());
        entity.setPasswordHash(passwordEncoder.encode(request.password()));
        entity.setDisplayName(request.displayName());
        entity.setSystemRole(request.systemRole() != null ? request.systemRole() : SystemRole.USER);
        entity.setStatus(request.status() != null ? request.status() : UserStatus.ACTIVE);
        return entity;
    }

    @Override
    protected UserResponse toResponseDto(UserEntity entity) {
        return new UserResponse(
                entity.getId(),
                entity.getUsername(),
                entity.getEmail(),
                entity.getDisplayName(),
                entity.getSystemRole().name(),
                entity.getStatus().name(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    @Override
    protected void updateEntityFromDto(CreateUserRequest request, UserEntity entity) {
        if (request.displayName() != null) entity.setDisplayName(request.displayName());
        if (request.email() != null) entity.setEmail(request.email());
        if (request.password() != null && !request.password().isBlank()) {
            entity.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        if (request.systemRole() != null) entity.setSystemRole(request.systemRole());
        if (request.status() != null) entity.setStatus(request.status());
    }
}
