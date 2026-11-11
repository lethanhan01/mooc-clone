package com.example.server.util;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Tiện ích xây dựng Specification type-safe an toàn chống SQL Injection
 * và hỗ trợ so sánh chuỗi linh hoạt cho cả trường String, Enum, và Số.
 */
public class SpecificationBuilder<E> {

    private final List<Specification<E>> specifications = new ArrayList<>();

    public static <E> SpecificationBuilder<E> builder() {
        return new SpecificationBuilder<>();
    }

    public SpecificationBuilder<E> withEqual(String field, Object value) {
        if (value != null && !value.toString().isBlank()) {
            specifications.add((root, query, cb) ->
                    cb.equal(root.get(field).as(String.class), value.toString().trim()));
        }
        return this;
    }

    public SpecificationBuilder<E> withLike(String field, String value) {
        if (value != null && !value.isBlank()) {
            specifications.add((root, query, cb) ->
                    cb.like(cb.lower(root.get(field).as(String.class)), "%" + value.trim().toLowerCase() + "%"));
        }
        return this;
    }

    public SpecificationBuilder<E> like(String field, String value) {
        return withLike(field, value);
    }

    public Specification<E> build() {
        if (specifications.isEmpty()) {
            return null;
        }
        return (root, query, cb) -> {
            List<Predicate> predicates = specifications.stream()
                    .map(spec -> spec.toPredicate(root, query, cb))
                    .filter(Objects::nonNull)
                    .toList();
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
