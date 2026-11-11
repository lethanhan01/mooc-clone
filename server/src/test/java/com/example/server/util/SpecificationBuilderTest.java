package com.example.server.util;

import com.example.server.entity.QuestionEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class SpecificationBuilderTest {

    @Test
    @DisplayName("SpecificationBuilder.build() trả về null khi không có điều kiện lọc nào")
    void build_WhenEmpty_ReturnsNull() {
        Specification<QuestionEntity> spec = SpecificationBuilder.<QuestionEntity>builder().build();
        assertNull(spec);
    }

    @Test
    @DisplayName("SpecificationBuilder.build() trả về Specification khi có điều kiện equal hoặc like")
    void build_WhenHasConditions_ReturnsNonNullSpec() {
        Specification<QuestionEntity> spec = SpecificationBuilder.<QuestionEntity>builder()
                .withEqual("status", "ACTIVE")
                .withLike("topic", "Java")
                .build();
        assertNotNull(spec);
    }
}
