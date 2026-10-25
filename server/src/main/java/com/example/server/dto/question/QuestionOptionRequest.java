package com.example.server.dto.question;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record QuestionOptionRequest(
        @NotBlank(message = "Nội dung phương án không được để trống")
        String content,

        short position,

        @NotNull(message = "Cờ đáp án đúng không được để trống")
        boolean isCorrect
) {}
