package com.example.server.dto.room;

import jakarta.validation.constraints.NotBlank;

public record JoinRoomRequest(
        @NotBlank(message = "Mã phòng không được để trống")
        String roomCode
) {}
