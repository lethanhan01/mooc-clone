package com.example.server.service;

import com.example.server.dto.question.CreateQuestionRequest;
import com.example.server.dto.question.QuestionResponse;
import com.example.server.entity.QuestionEntity;

import java.util.List;

public interface QuestionService extends BaseService<QuestionEntity, Long, CreateQuestionRequest, QuestionResponse> {
    List<QuestionResponse> findByTopic(String topic);
}
