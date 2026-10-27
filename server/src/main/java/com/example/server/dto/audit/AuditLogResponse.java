package com.example.server.dto.audit;

import java.time.OffsetDateTime;

public record AuditLogResponse(
        Long id,
        Long actorUserId,
        String actorDisplayName,
        String action,
        String entityType,
        Long entityId,
        String ipAddress,
        String metadata,
        OffsetDateTime occurredAt
) {}
