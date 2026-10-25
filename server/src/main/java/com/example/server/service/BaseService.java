package com.example.server.service;

import com.example.server.dto.common.PageResponse;
import com.example.server.entity.BaseEntity;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Hợp đồng Service Generic cung cấp các thao tác CRUD cơ sở.
 */
public interface BaseService<E extends BaseEntity, I, Q, R> {
    List<R> findAll();
    PageResponse<R> findAll(Pageable pageable);
    R findById(I id);
    R create(Q request);
    R update(I id, Q request);
    void deleteById(I id);
}
