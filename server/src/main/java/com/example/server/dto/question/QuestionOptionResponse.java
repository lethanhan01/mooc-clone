package com.example.server.dto.question;

public record QuestionOptionResponse(
        Long id,
        String content,
        short position,
        Boolean isCorrect
) {}
