package com.example.server.dto.common;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private int code;
    private String status;
    private String message;
    private T data;
    private List<FieldErrorDto> errors;
    private OffsetDateTime timestamp = OffsetDateTime.now(ZoneOffset.UTC);

    public ApiResponse() {}

    public ApiResponse(int code, String status, String message, T data, List<FieldErrorDto> errors, OffsetDateTime timestamp) {
        this.code = code;
        this.status = status;
        this.message = message;
        this.data = data;
        this.errors = errors;
        this.timestamp = timestamp != null ? timestamp : OffsetDateTime.now(ZoneOffset.UTC);
    }

    public int getCode() { return code; }
    public void setCode(int code) { this.code = code; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
    public List<FieldErrorDto> getErrors() { return errors; }
    public void setErrors(List<FieldErrorDto> errors) { this.errors = errors; }
    public OffsetDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "SUCCESS", "Thành công", data, null, OffsetDateTime.now(ZoneOffset.UTC));
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(200, "SUCCESS", message, data, null, OffsetDateTime.now(ZoneOffset.UTC));
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(code, "ERROR", message, null, null, OffsetDateTime.now(ZoneOffset.UTC));
    }

    public static <T> ApiResponseBuilder<T> builder() {
        return new ApiResponseBuilder<>();
    }

    public static class ApiResponseBuilder<T> {
        private int code;
        private String status;
        private String message;
        private T data;
        private List<FieldErrorDto> errors;
        private OffsetDateTime timestamp = OffsetDateTime.now(ZoneOffset.UTC);

        public ApiResponseBuilder<T> code(int code) { this.code = code; return this; }
        public ApiResponseBuilder<T> status(String status) { this.status = status; return this; }
        public ApiResponseBuilder<T> message(String message) { this.message = message; return this; }
        public ApiResponseBuilder<T> data(T data) { this.data = data; return this; }
        public ApiResponseBuilder<T> errors(List<FieldErrorDto> errors) { this.errors = errors; return this; }
        public ApiResponseBuilder<T> timestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; return this; }

        public ApiResponse<T> build() {
            return new ApiResponse<>(code, status, message, data, errors, timestamp);
        }
    }
}
