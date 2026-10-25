package com.example.server.service.impl;

import com.example.server.dto.common.PageResponse;
import com.example.server.entity.BaseEntity;
import com.example.server.exception.AppException;
import com.example.server.exception.ErrorCode;
import com.example.server.service.BaseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Hiện thực hóa Generic CRUD Service với các abstract method chuyển đổi Entity <-> DTO.
 */
@Transactional
public abstract class BaseServiceImpl<E extends BaseEntity, I, Q, R, M extends JpaRepository<E, I>>
        implements BaseService<E, I, Q, R> {

    protected final M repository;

    protected BaseServiceImpl(M repository) {
        this.repository = repository;
    }

    protected abstract E toEntity(Q request);
    protected abstract R toResponseDto(E entity);
    protected abstract void updateEntityFromDto(Q request, E entity);

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
    public R findById(I id) {
        return repository.findById(id)
                .map(this::toResponseDto)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bản ghi với ID: " + id));
    }

    @Override
    public R create(Q request) {
        E entity = toEntity(request);
        E saved = repository.save(entity);
        return toResponseDto(saved);
    }

    @Override
    public R update(I id, Q request) {
        E entity = repository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bản ghi với ID: " + id));
        updateEntityFromDto(request, entity);
        E updated = repository.save(entity);
        return toResponseDto(updated);
    }

    @Override
    public void deleteById(I id) {
        if (!repository.existsById(id)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bản ghi để xóa với ID: " + id);
        }
        repository.deleteById(id);
    }
}
