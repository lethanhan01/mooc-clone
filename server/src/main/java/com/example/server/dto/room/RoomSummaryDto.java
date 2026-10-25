package com.example.server.dto.room;

public record RoomSummaryDto(
        Long id,
        String roomCode,
        String roomName,
        String status,
        int durationSeconds,
        int totalQuestions,
        int participantsCount,
        Long ownerId,
        String ownerDisplayName
) {
    public String name() {
        return roomName;
    }
}
