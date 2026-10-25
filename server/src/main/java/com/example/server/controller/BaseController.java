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
public abstract class BaseController<E extends BaseEntity, I, Q, R, S extends BaseService<E, I, Q, R>> {

    protected final S service;

    protected BaseController(S service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<R>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(service.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<R>>> getPage(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(service.findAll(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<R>> getById(@PathVariable I id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<R>> create(@Valid @RequestBody Q request) {
        R created = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Tạo mới thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<R>> update(@PathVariable I id, @Valid @RequestBody Q request) {
        R updated = service.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable I id) {
        service.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa bản ghi thành công", null));
    }
}
