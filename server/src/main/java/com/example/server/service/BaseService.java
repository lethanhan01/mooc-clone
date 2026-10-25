package com.example.server.service;

import com.example.server.dto.common.PageResponse;
import com.example.server.entity.BaseEntity;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Hợp đồng Service Generic cung cấp các thao tác CRUD cơ sở.
 */
public interface BaseService<E extends BaseEntity, ID, ReqDto, ResDto> {
    List<ResDto> findAll();
    PageResponse<ResDto> findAll(Pageable pageable);
    ResDto findById(ID id);
    ResDto create(ReqDto request);
    ResDto update(ID id, ReqDto request);
    void deleteById(ID id);
}
