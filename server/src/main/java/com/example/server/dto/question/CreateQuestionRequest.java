package com.example.server.dto.question;

import com.example.server.entity.enums.DifficultyLevel;
import com.example.server.entity.enums.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateQuestionRequest(
        @NotBlank(message = "Chủ đề không được để trống")
        @Size(max = 100, message = "Chủ đề tối đa 100 ký tự")
        String topic,

        @NotNull(message = "Độ khó không được để trống")
        DifficultyLevel difficulty,

        @NotNull(message = "Loại câu hỏi không được để trống")
        QuestionType questionType,

        @NotBlank(message = "Nội dung câu hỏi không được để trống")
        String content,

        @NotEmpty(message = "Câu hỏi phải có ít nhất 2 phương án")
        @Size(min = 2, max = 10, message = "Số lượng phương án từ 2 đến 10")
        List<@Valid QuestionOptionRequest> options
) {}
