package com.example.server.service;

import com.example.server.dto.attempt.AttemptResultResponse;
import com.example.server.dto.attempt.StartAttemptRequest;
import com.example.server.entity.ExamAttemptEntity;

public interface ExamAttemptService extends BaseService<ExamAttemptEntity, Long, StartAttemptRequest, AttemptResultResponse> {
    void submitAnswer(Long attemptId, Long questionId, Long selectedOptionId);
    AttemptResultResponse submitExam(Long attemptId);
    AttemptResultResponse getResult(Long attemptId);
}
