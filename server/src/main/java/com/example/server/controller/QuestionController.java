package com.example.server.controller;

import com.example.server.dto.common.ApiResponse;
import com.example.server.dto.question.CreateQuestionRequest;
import com.example.server.dto.question.QuestionResponse;
import com.example.server.entity.QuestionEntity;
import com.example.server.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller quản lý Ngân hàng câu hỏi kế thừa trọn vẹn 5 API CRUD chuẩn từ BaseController.
 * Các thao tác ghi (Tạo, Sửa, Xóa) yêu cầu quyền ADMIN.
 */
@RestController
@RequestMapping("/api/questions")
@Tag(name = "Questions", description = "Quản lý ngân hàng câu hỏi và phương án trắc nghiệm (Kế thừa BaseController)")
public class QuestionController extends BaseController<QuestionEntity, Long, CreateQuestionRequest, QuestionResponse, QuestionService> {

    public QuestionController(QuestionService service) {
        super(service);
    }

    @GetMapping("/topic/{topic}")
    @Operation(summary = "Lấy danh sách câu hỏi hoạt động theo chủ đề")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getByTopic(@PathVariable String topic) {
        return ResponseEntity.ok(ApiResponse.success(service.findByTopic(topic)));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo câu hỏi mới kèm danh sách phương án (Dành riêng cho ADMIN)")
    public ResponseEntity<ApiResponse<QuestionResponse>> create(@Valid @RequestBody CreateQuestionRequest request) {
        return super.create(request);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật nội dung câu hỏi (Dành riêng cho ADMIN)")
    public ResponseEntity<ApiResponse<QuestionResponse>> update(@PathVariable Long id, @Valid @RequestBody CreateQuestionRequest request) {
        return super.update(id, request);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa mềm câu hỏi khỏi ngân hàng đề thi (Dành riêng cho ADMIN)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        return super.delete(id);
    }
}
