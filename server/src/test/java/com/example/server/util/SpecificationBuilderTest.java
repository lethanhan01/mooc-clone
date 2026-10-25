package com.example.server.util;

import com.example.server.entity.QuestionEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.Set;

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
                .equal("status", "ACTIVE")
                .like("topic", "Java")
                .build();
        assertNotNull(spec);
    }

    @Test
    @DisplayName("SpecificationBuilder.fromRequest() trích xuất tham số query chính xác")
    void fromRequest_ExtractsParamsCorrectly() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setParameter("status", "ACTIVE");
        request.setParameter("topic", "Toán học");
        request.setParameter("page", "0"); // Tham số ngoài whitelist

        Specification<QuestionEntity> spec = SpecificationBuilder.fromRequest(
                request,
                Set.of("status"),
                Set.of("topic")
        );
        assertNotNull(spec);
    }

    @Test
    @DisplayName("SpecificationBuilder.fromRequest() trả về null khi request rỗng hoặc param không nằm trong whitelist")
    void fromRequest_WhenNoWhitelistedParams_ReturnsNull() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setParameter("page", "0");
        request.setParameter("size", "20");

        Specification<QuestionEntity> spec = SpecificationBuilder.fromRequest(
                request,
                Set.of("status"),
                Set.of("topic")
        );
        assertNull(spec);
    }
}
