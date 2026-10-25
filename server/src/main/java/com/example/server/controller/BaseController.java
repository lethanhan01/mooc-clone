package com.example.server.controller;

import com.example.server.dto.common.ApiResponse;
import com.example.server.dto.common.PageResponse;
import com.example.server.entity.BaseEntity;
import com.example.server.service.BaseService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.util.List;

/**
 * Controller trừu tượng tự động cung cấp 5 API CRUD chuẩn kèm phân trang và lọc động type-safe.
 */
public abstract class BaseController<
        E extends BaseEntity,
        I extends Serializable,
        C,
        U,
        R,
        S extends BaseService<E, I, C, U, R>> {

    protected final S service;

    protected BaseController(S service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<R>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(service.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<R>>> getPage(
            @PageableDefault(size = 20) Pageable pageable,
            HttpServletRequest request) {
        Specification<E> spec = buildSpecification(request);
        return ResponseEntity.ok(ApiResponse.success(service.findAll(spec, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<R>> getById(@PathVariable I id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<R>> create(@Valid @RequestBody C request) {
        R created = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Tạo mới thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<R>> update(@PathVariable I id, @Valid @RequestBody U request) {
        R updated = service.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable I id) {
        service.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa bản ghi thành công", null));
    }

    /**
     * Hook method cho Controller con tự định nghĩa điều kiện lọc Specification.
     */
    protected Specification<E> buildSpecification(HttpServletRequest request) {
        return null;
    }

    /**
     * Helper cho Controller con muốn mở endpoint Batch Create.
     */
    protected ResponseEntity<ApiResponse<List<R>>> handleBatchCreate(List<C> requests) {
        List<R> created = service.saveAll(requests);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Tạo theo lô thành công", created));
    }

    /**
     * Helper cho Controller con muốn mở endpoint Batch Delete.
     */
    protected ResponseEntity<ApiResponse<Void>> handleBatchDelete(List<I> ids) {
        service.deleteAllById(ids);
        return ResponseEntity.ok(ApiResponse.success("Xóa theo lô thành công", null));
    }
}
