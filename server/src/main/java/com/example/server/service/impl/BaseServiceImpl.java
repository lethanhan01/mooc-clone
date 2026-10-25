package com.example.server.service.impl;

import com.example.server.dto.common.PageResponse;
import com.example.server.entity.BaseEntity;
import com.example.server.exception.AppException;
import com.example.server.exception.ErrorCode;
import com.example.server.repository.BaseRepository;
import com.example.server.service.BaseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Hiện thực hóa Generic CRUD Service với phân trang Specification, Batch operations và Lifecycle Hooks.
 */
@Transactional
public abstract class BaseServiceImpl<
        E extends BaseEntity,
        I extends Serializable,
        C,
        U,
        R,
        M extends BaseRepository<E, I>>
        implements BaseService<E, I, C, U, R> {

    protected final M repository;

    protected BaseServiceImpl(M repository) {
        this.repository = repository;
    }

    // Abstract mapping methods
    protected abstract E toEntity(C request);
    protected abstract R toResponseDto(E entity);
    protected abstract void updateEntityFromDto(U request, E entity);

    // Lifecycle hooks (Extension points)
    protected void beforeCreate(C request) {}
    protected void afterCreate(E entity, R response) {}
    protected void beforeUpdate(I id, U request, E existingEntity) {}
    protected void afterUpdate(E entity, R response) {}
    protected void beforeDelete(I id, E entity) {}
    protected void doDelete(E entity) {
        repository.delete(entity);
    }
    protected void afterDelete(I id) {}

    @Override
    @Transactional(readOnly = true)
    public List<R> findAll() {
        return repository.findAll().stream().map(this::toResponseDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<R> findAll(Pageable pageable) {
        Page<R> page = repository.findAll(pageable).map(this::toResponseDto);
        return PageResponse.from(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<R> findAll(Specification<E> spec, Pageable pageable) {
        if (spec == null) {
            return findAll(pageable);
        }
        Page<R> page = repository.findAll(spec, pageable).map(this::toResponseDto);
        return PageResponse.from(page);
    }

    @Override
    @Transactional(readOnly = true)
    public R findById(I id) {
        return repository.findById(id)
                .map(this::toResponseDto)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bản ghi với ID: " + id));
    }

    @Override
    public R create(C request) {
        beforeCreate(request);
        E entity = toEntity(request);
        E saved = repository.save(entity);
        R response = toResponseDto(saved);
        afterCreate(saved, response);
        return response;
    }

    @Override
    public R update(I id, U request) {
        E entity = repository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bản ghi với ID: " + id));
        beforeUpdate(id, request, entity);
        updateEntityFromDto(request, entity);
        E updated = repository.save(entity);
        R response = toResponseDto(updated);
        afterUpdate(updated, response);
        return response;
    }

    @Override
    public void deleteById(I id) {
        E entity = repository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bản ghi để xóa với ID: " + id));
        beforeDelete(id, entity);
        doDelete(entity);
        afterDelete(id);
    }

    @Override
    public List<R> saveAll(List<C> requests) {
        if (requests == null || requests.isEmpty()) {
            return List.of();
        }
        return requests.stream()
                .map(this::create)
                .toList();
    }

    @Override
    public void deleteAllById(List<I> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }
        for (I id : ids) {
            deleteById(id);
        }
    }
}
