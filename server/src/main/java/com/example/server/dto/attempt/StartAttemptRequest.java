package com.example.server.dto.attempt;

import com.example.server.entity.enums.AttemptMode;
import jakarta.validation.constraints.NotNull;

public record StartAttemptRequest(
        String roomCode,

        @NotNull(message = "Chế độ thi không được để trống")
        AttemptMode mode
) {}
