package com.example.server.service;

import com.example.server.dto.common.PageResponse;
import com.example.server.entity.BaseEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.io.Serializable;
import java.util.List;

/**
 * Hợp đồng Service Generic cung cấp các thao tác CRUD cơ sở, phân trang kèm lọc động và batch.
 *
 * @param <E> Thực thể Domain
 * @param <I> Kiểu khóa chính (Serializable)
 * @param <C> DTO yêu cầu tạo mới (Create)
 * @param <U> DTO yêu cầu cập nhật (Update)
 * @param <R> DTO phản hồi (Response)
 */
public interface BaseService<E extends BaseEntity, I extends Serializable, C, U, R> {
    List<R> findAll();
    PageResponse<R> findAll(Pageable pageable);
    PageResponse<R> findAll(Specification<E> spec, Pageable pageable);
    R findById(I id);
    R create(C request);
    R update(I id, U request);
    void deleteById(I id);

    // Thao tác hàng loạt (Batch operations)
    List<R> saveAll(List<C> requests);
    void deleteAllById(List<I> ids);
}
