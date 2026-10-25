package com.example.server.dto.question;

import java.time.OffsetDateTime;
import java.util.List;

public record QuestionResponse(
        Long id,
        String topic,
        String difficulty,
        String questionType,
        String content,
        String status,
        List<QuestionOptionResponse> options,
        OffsetDateTime createdAt
) {}
