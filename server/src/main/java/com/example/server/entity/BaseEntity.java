package com.example.server.entity;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

import java.io.Serializable;

/**
 * Lớp cha trừu tượng dùng chung cho các Entity có Surrogate Key (id BIGINT).
 * Không áp dụng cho các Entity có khóa chính phức hợp (@EmbeddedId).
 */
@MappedSuperclass
public abstract class BaseEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public BaseEntity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
}
