package com.example.server.repository;

import com.example.server.entity.SessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<SessionEntity, Long> {
    Optional<SessionEntity> findByTokenHash(byte[] tokenHash);
    Optional<SessionEntity> findByTokenHashAndRevokedAtIsNull(byte[] tokenHash);
    List<SessionEntity> findByUserId(Long userId);
}
