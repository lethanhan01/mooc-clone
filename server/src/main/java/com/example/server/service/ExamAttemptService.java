package com.example.server.service;

import com.example.server.dto.attempt.AttemptResultResponse;
import com.example.server.dto.attempt.StartAttemptRequest;

public interface ExamAttemptService {
    AttemptResultResponse startAttempt(StartAttemptRequest request);
    void submitAnswer(Long attemptId, Long questionId, Long selectedOptionId);
    AttemptResultResponse submitExam(Long attemptId);
    AttemptResultResponse getResult(Long attemptId);
}
