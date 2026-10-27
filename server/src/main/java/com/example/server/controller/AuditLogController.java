package com.example.server.controller;

import com.example.server.dto.audit.AuditLogResponse;
import com.example.server.dto.common.ApiResponse;
import com.example.server.entity.AuditLogEntity;
import com.example.server.repository.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@Tag(name = "Audit Logs", description = "Truy xuất nhật ký giám sát hoạt động hệ thống")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    @Operation(summary = "Lấy toàn bộ nhật ký hệ thống sắp xếp theo thời gian mới nhất")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getLogs() {
        List<AuditLogEntity> entities = auditLogRepository.findAll(Sort.by(Sort.Direction.DESC, "occurredAt"));
        List<AuditLogResponse> response = entities.stream().map(e -> new AuditLogResponse(
                e.getId(),
                e.getActor() != null ? e.getActor().getId() : null,
                e.getActor() != null ? e.getActor().getDisplayName() : "Hệ thống",
                e.getAction(),
                e.getEntityType(),
                e.getEntityId(),
                e.getIpAddress(),
                e.getMetadata(),
                e.getOccurredAt()
        )).toList();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
