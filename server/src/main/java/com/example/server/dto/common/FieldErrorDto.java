package com.example.server.dto.common;

public record FieldErrorDto(
        String field,
        String message
) {}
