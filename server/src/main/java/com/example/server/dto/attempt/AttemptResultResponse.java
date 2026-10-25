package com.example.server.dto.attempt;

import java.time.OffsetDateTime;
import java.util.List;

public record AttemptResultResponse(
        Long attemptId,
        Long userId,
        String username,
        String displayName,
        Long roomId,
        String roomCode,
        String mode,
        String status,
        int totalQuestions,
        int answeredCount,
        int correctCount,
        int wrongCount,
        int unansweredCount,
        double score10,
        double correctPercent,
        OffsetDateTime startedAt,
        OffsetDateTime submittedAt,
        List<AttemptAnswerResponse> answers
) {}
