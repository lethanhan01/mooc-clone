package com.example.server.controller;

import com.example.server.dto.question.CreateQuestionRequest;
import com.example.server.dto.question.QuestionResponse;
import com.example.server.entity.QuestionEntity;
import com.example.server.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller quản lý Ngân hàng câu hỏi kế thừa trọn vẹn 5 API CRUD chuẩn từ BaseController.
 */
@RestController
@RequestMapping("/api/questions")
@Tag(name = "Questions", description = "Quản lý ngân hàng câu hỏi và phương án trắc nghiệm (Kế thừa BaseController)")
public class QuestionController extends BaseController<QuestionEntity, Long, CreateQuestionRequest, QuestionResponse, QuestionService> {

    public QuestionController(QuestionService service) {
        super(service);
    }
}
