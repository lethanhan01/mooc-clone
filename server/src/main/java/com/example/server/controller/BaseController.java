package com.example.server.controller;

import com.example.server.dto.common.ApiResponse;
import com.example.server.dto.common.PageResponse;
import com.example.server.entity.BaseEntity;
import com.example.server.service.BaseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

/**
 * Controller trừu tượng tự động cung cấp 5 API CRUD chuẩn kèm phân trang.
 */
public abstract class BaseController<E extends BaseEntity, ID, ReqDto, ResDto, S extends BaseService<E, ID, ReqDto, ResDto>> {

    protected final S service;

    protected BaseController(S service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(service.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<ResDto>>> getPage(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(service.findAll(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResDto>> getById(@PathVariable ID id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResDto>> create(@Valid @RequestBody ReqDto request) {
        ResDto created = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Tạo mới thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResDto>> update(@PathVariable ID id, @Valid @RequestBody ReqDto request) {
        ResDto updated = service.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable ID id) {
        service.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa bản ghi thành công", null));
    }
}
