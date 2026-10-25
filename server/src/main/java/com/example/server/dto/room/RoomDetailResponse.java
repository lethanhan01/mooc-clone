package com.example.server.dto.room;

import java.time.OffsetDateTime;
import java.util.List;

public record RoomDetailResponse(
        Long id,
        String roomCode,
        String name,
        String description,
        String topic,
        int easyCount,
        int mediumCount,
        int hardCount,
        String visibility,
        String status,
        int durationSeconds,
        Integer maxParticipants,
        OffsetDateTime startedAt,
        OffsetDateTime endsAt,
        Long ownerId,
        String ownerDisplayName,
        List<String> participantUsernames
) {}
