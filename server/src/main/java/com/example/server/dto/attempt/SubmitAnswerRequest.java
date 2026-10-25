package com.example.server.dto.attempt;

import jakarta.validation.constraints.NotNull;

public record SubmitAnswerRequest(
        @NotNull(message = "ID câu hỏi không được để trống")
        Long questionId,

        Long selectedOptionId
) {}
