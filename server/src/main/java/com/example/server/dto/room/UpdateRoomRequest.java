package com.example.server.dto.room;

import com.example.server.entity.enums.RoomStatus;
import com.example.server.entity.enums.RoomVisibility;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateRoomRequest(
        @Size(max = 120, message = "Tên phòng tối đa 120 ký tự")
        String name,

        String description,
        String topic,
        RoomVisibility visibility,
        RoomStatus status,

        @Min(value = 60, message = "Thời lượng tối thiểu 60 giây")
        Integer durationSeconds,

        Integer maxParticipants
) {}
