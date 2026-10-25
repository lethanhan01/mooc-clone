package com.example.server.service;

import com.example.server.dto.common.PageResponse;
import com.example.server.entity.BaseEntity;
import com.example.server.exception.AppException;
import com.example.server.repository.BaseRepository;
import com.example.server.service.impl.BaseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BaseServiceImplTest {

    static class DummyEntity extends BaseEntity {
        private String name;
        private boolean deleted = false;

        public DummyEntity() {}
        public DummyEntity(Long id, String name) {
            setId(id);
            this.name = name;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public boolean isDeleted() { return deleted; }
        public void setDeleted(boolean deleted) { this.deleted = deleted; }
    }

    record DummyCreateReq(String name) {}
    record DummyUpdateReq(String name) {}
    record DummyRes(Long id, String name, boolean deleted) {}

    static class TestServiceImpl extends BaseServiceImpl<DummyEntity, Long, DummyCreateReq, DummyUpdateReq, DummyRes, BaseRepository<DummyEntity, Long>> {
        final List<String> hookTraces = new ArrayList<>();

        public TestServiceImpl(BaseRepository<DummyEntity, Long> repository) {
            super(repository);
        }

        @Override
        protected DummyEntity toEntity(DummyCreateReq request) {
            DummyEntity entity = new DummyEntity();
            entity.setName(request.name());
            return entity;
        }

        @Override
        protected DummyRes toResponseDto(DummyEntity entity) {
            return new DummyRes(entity.getId(), entity.getName(), entity.isDeleted());
        }

        @Override
        protected void updateEntityFromDto(DummyUpdateReq request, DummyEntity entity) {
            if (request.name() != null) entity.setName(request.name());
        }

        @Override
        protected void beforeCreate(DummyCreateReq request) {
            hookTraces.add("beforeCreate:" + request.name());
        }

        @Override
        protected void afterCreate(DummyEntity entity, DummyRes response) {
            hookTraces.add("afterCreate:" + response.name());
        }

        @Override
        protected void beforeUpdate(Long id, DummyUpdateReq request, DummyEntity existingEntity) {
            hookTraces.add("beforeUpdate:" + id);
        }

        @Override
        protected void afterUpdate(DummyEntity entity, DummyRes response) {
            hookTraces.add("afterUpdate:" + response.name());
        }

        @Override
        protected void beforeDelete(Long id, DummyEntity entity) {
            hookTraces.add("beforeDelete:" + id);
        }

        @Override
        protected void doDelete(DummyEntity entity) {
            hookTraces.add("doDelete(SoftDelete):" + entity.getId());
            entity.setDeleted(true);
            repository.save(entity);
        }

        @Override
        protected void afterDelete(Long id) {
            hookTraces.add("afterDelete:" + id);
        }
    }

    @Mock
    private BaseRepository<DummyEntity, Long> repository;

    private TestServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new TestServiceImpl(repository);
    }

    @Test
    @DisplayName("Create kích hoạt đầy đủ beforeCreate và afterCreate lifecycle hooks")
    void create_TriggersBeforeAndAfterHooks() {
        DummyCreateReq req = new DummyCreateReq("Item 1");
        DummyEntity savedEntity = new DummyEntity(1L, "Item 1");
        when(repository.save(any(DummyEntity.class))).thenReturn(savedEntity);

        DummyRes res = service.create(req);

        assertNotNull(res);
        assertEquals(1L, res.id());
        assertEquals("Item 1", res.name());
        assertTrue(service.hookTraces.contains("beforeCreate:Item 1"));
        assertTrue(service.hookTraces.contains("afterCreate:Item 1"));
    }

    @Test
    @DisplayName("Update kích hoạt đầy đủ beforeUpdate và afterUpdate lifecycle hooks")
    void update_TriggersBeforeAndAfterHooks() {
        DummyEntity existing = new DummyEntity(10L, "Old Name");
        when(repository.findById(10L)).thenReturn(Optional.of(existing));
        when(repository.save(any(DummyEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        DummyUpdateReq req = new DummyUpdateReq("New Name");
        DummyRes res = service.update(10L, req);

        assertEquals("New Name", res.name());
        assertTrue(service.hookTraces.contains("beforeUpdate:10"));
        assertTrue(service.hookTraces.contains("afterUpdate:New Name"));
    }

    @Test
    @DisplayName("deleteById kích hoạt beforeDelete, doDelete và afterDelete hooks")
    void deleteById_TriggersLifecycleHooksAndSoftDelete() {
        DummyEntity existing = new DummyEntity(5L, "Delete Me");
        when(repository.findById(5L)).thenReturn(Optional.of(existing));

        service.deleteById(5L);

        assertTrue(service.hookTraces.contains("beforeDelete:5"));
        assertTrue(service.hookTraces.contains("doDelete(SoftDelete):5"));
        assertTrue(service.hookTraces.contains("afterDelete:5"));
        verify(repository).save(existing);
        assertTrue(existing.isDeleted());
    }

    @Test
    @DisplayName("deleteById ném AppException khi không tìm thấy ID")
    void deleteById_WhenNotFound_ThrowsException() {
        when(repository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(AppException.class, () -> service.deleteById(999L));
    }

    @Test
    @DisplayName("saveAll xử lý danh sách và kích hoạt hooks cho từng phần tử")
    void saveAll_ProcessesBatchAndTriggersHooks() {
        when(repository.save(any(DummyEntity.class))).thenAnswer(inv -> {
            DummyEntity e = inv.getArgument(0);
            e.setId(100L);
            return e;
        });

        List<DummyCreateReq> requests = List.of(new DummyCreateReq("Batch 1"), new DummyCreateReq("Batch 2"));
        List<DummyRes> responses = service.saveAll(requests);

        assertEquals(2, responses.size());
        assertTrue(service.hookTraces.contains("beforeCreate:Batch 1"));
        assertTrue(service.hookTraces.contains("beforeCreate:Batch 2"));
    }

    @Test
    @DisplayName("findAll với Specification gọi repository.findAll(spec, pageable)")
    void findAll_WithSpecification_ExecutesCorrectly() {
        Pageable pageable = PageRequest.of(0, 10);
        Specification<DummyEntity> spec = (root, query, cb) -> cb.conjunction();
        DummyEntity entity = new DummyEntity(1L, "Spec Item");
        when(repository.findAll(spec, pageable)).thenReturn(new PageImpl<>(List.of(entity), pageable, 1));

        PageResponse<DummyRes> result = service.findAll(spec, pageable);

        assertNotNull(result);
        assertEquals(1, result.items().size());
        assertEquals("Spec Item", result.items().get(0).name());
        verify(repository).findAll(spec, pageable);
    }
}
