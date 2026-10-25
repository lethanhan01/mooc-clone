package com.example.server.dto.attempt;

import java.time.OffsetDateTime;

public record AttemptAnswerResponse(
        Long questionId,
        int position,
        Long selectedOptionId,
        OffsetDateTime answeredAt
) {}
