package com.example.server.dto.question;

import com.example.server.entity.enums.DifficultyLevel;
import com.example.server.entity.enums.QuestionStatus;
import com.example.server.entity.enums.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateQuestionRequest(
        @Size(max = 100, message = "Chủ đề tối đa 100 ký tự")
        String topic,

        DifficultyLevel difficulty,
        QuestionType questionType,
        String content,
        QuestionStatus status,

        @Size(min = 2, max = 10, message = "Số lượng phương án từ 2 đến 10 nếu có thay đổi")
        List<@Valid QuestionOptionRequest> options
) {}
