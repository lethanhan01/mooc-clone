package com.example.server.dto.room;

import com.example.server.entity.enums.RoomVisibility;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateRoomRequest(
        @NotBlank(message = "Mã phòng không được để trống")
        @Size(max = 12, message = "Mã phòng tối đa 12 ký tự")
        String roomCode,

        @NotBlank(message = "Tên phòng không được để trống")
        @Size(max = 120, message = "Tên phòng tối đa 120 ký tự")
        String name,

        String description,
        String topic,

        @Min(value = 0, message = "Số câu dễ không được âm")
        int easyCount,

        @Min(value = 0, message = "Số câu trung bình không được âm")
        int mediumCount,

        @Min(value = 0, message = "Số câu khó không được âm")
        int hardCount,

        @NotNull(message = "Phạm vi hiển thị không được để trống")
        RoomVisibility visibility,

        @Min(value = 60, message = "Thời gian làm bài tối thiểu 60 giây")
        @Max(value = 7200, message = "Thời gian làm bài tối đa 7200 giây")
        int durationSeconds,

        Integer maxParticipants
) {}
