package com.example.server.repository;

import com.example.server.entity.AuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogEntity, Long> {
    List<AuditLogEntity> findByActorId(Long actorId);
    List<AuditLogEntity> findByAction(String action);
    List<AuditLogEntity> findByEntityTypeAndEntityId(String entityType, Long entityId);
}
