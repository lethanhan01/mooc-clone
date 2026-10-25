package com.example.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

import java.io.Serializable;

/**
 * Hợp đồng Repository cơ sở kết hợp CRUD chuẩn của JPA và hỗ trợ tìm kiếm lọc động Specification.
 *
 * @param <E>  Thực thể JPA
 * @param <I> Khóa chính thực thể
 */
@NoRepositoryBean
public interface BaseRepository<E,  extends Serializable>
        extends JpaRepository<E, I>, JpaSpecificationExecutor<E> {
}
