package com.example.server.controller;

import com.example.server.dto.attempt.AttemptResultResponse;
import com.example.server.dto.attempt.StartAttemptRequest;
import com.example.server.dto.attempt.SubmitAnswerRequest;
import com.example.server.dto.common.ApiResponse;
import com.example.server.entity.ExamAttemptEntity;
import com.example.server.service.ExamAttemptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller quản lý Lượt thi và Chấm điểm kế thừa 5 API CRUD chuẩn từ BaseController
 * và mở rộng các hành vi nộp câu trả lời, nộp bài thi, xem kết quả.
 */
@RestController
@RequestMapping("/api/attempts")
@Tag(name = "Exam Attempts", description = "Quản lý lượt thi, nộp bài và kết quả chấm thi (Kế thừa BaseController)")
public class ExamAttemptController extends BaseController<ExamAttemptEntity, Long, StartAttemptRequest, AttemptResultResponse, ExamAttemptService> {

    public ExamAttemptController(ExamAttemptService service) {
        super(service);
    }

    @PostMapping("/{id}/answers")
    @Operation(summary = "Lưu hoặc thay đổi phương án đã chọn cho câu hỏi")
    public ResponseEntity<ApiResponse<Void>> submitAnswer(
            @PathVariable Long id,
            @Valid @RequestBody SubmitAnswerRequest request) {
        service.submitAnswer(id, request.questionId(), request.selectedOptionId());
        return ResponseEntity.ok(ApiResponse.success("Đã ghi nhận câu trả lời", null));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Nộp bài thi chính thức và chấm điểm tức thì")
    public ResponseEntity<ApiResponse<AttemptResultResponse>> submitExam(@PathVariable Long id) {
        AttemptResultResponse result = service.submitExam(id);
        return ResponseEntity.ok(ApiResponse.success("Nộp bài thi thành công", result));
    }

    @GetMapping("/{id}/result")
    @Operation(summary = "Tra cứu kết quả chi tiết của lượt thi")
    public ResponseEntity<ApiResponse<AttemptResultResponse>> getResult(@PathVariable Long id) {
        AttemptResultResponse result = service.getResult(id);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
