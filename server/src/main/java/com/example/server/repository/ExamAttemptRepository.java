package com.example.server.repository;

import com.example.server.entity.ExamAttemptEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttemptEntity, Long> {
    @Override
    @EntityGraph(attributePaths = {"user", "room"})
    Optional<ExamAttemptEntity> findById(Long id);

    Optional<ExamAttemptEntity> findByRoomIdAndUserId(Long roomId, Long userId);
    List<ExamAttemptEntity> findByUserId(Long userId);
    List<ExamAttemptEntity> findByRoomId(Long roomId);
}
