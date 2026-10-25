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
public abstract class BaseServiceImpl<E extends BaseEntity, ID, ReqDto, ResDto, R extends JpaRepository<E, ID>>
        implements BaseService<E, ID, ReqDto, ResDto> {

    protected final R repository;

    protected BaseServiceImpl(R repository) {
        this.repository = repository;
    }

    protected abstract E toEntity(ReqDto request);
    protected abstract ResDto toResponseDto(E entity);
    protected abstract void updateEntityFromDto(ReqDto request, E entity);

    @Override
    @Transactional(readOnly = true)
    public List<ResDto> findAll() {
        return repository.findAll().stream().map(this::toResponseDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ResDto> findAll(Pageable pageable) {
        Page<ResDto> page = repository.findAll(pageable).map(this::toResponseDto);
        return PageResponse.from(page);
    }

    @Override
    @Transactional(readOnly = true)
    public ResDto findById(ID id) {
        return repository.findById(id)
                .map(this::toResponseDto)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bản ghi với ID: " + id));
    }

    @Override
    public ResDto create(ReqDto request) {
        E entity = toEntity(request);
        E saved = repository.save(entity);
        return toResponseDto(saved);
    }

    @Override
    public ResDto update(ID id, ReqDto request) {
        E entity = repository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bản ghi với ID: " + id));
        updateEntityFromDto(request, entity);
        E updated = repository.save(entity);
        return toResponseDto(updated);
    }

    @Override
    public void deleteById(ID id) {
        if (!repository.existsById(id)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy bản ghi để xóa với ID: " + id);
        }
        repository.deleteById(id);
    }
}
