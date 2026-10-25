package com.example.server.dto.question;

import com.example.server.entity.enums.DifficultyLevel;
import com.example.server.entity.enums.QuestionStatus;
import com.example.server.entity.enums.QuestionType;
import jakarta.validation.Valid;

import java.util.List;

public record UpdateQuestionRequest(
        String topic,
        DifficultyLevel difficulty,
        QuestionType questionType,
        String content,
        QuestionStatus status,
        List<@Valid QuestionOptionRequest> options
) {}
