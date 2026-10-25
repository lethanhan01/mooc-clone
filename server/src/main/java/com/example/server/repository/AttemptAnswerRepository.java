package com.example.server.repository;

import com.example.server.entity.AttemptAnswerEntity;
import com.example.server.entity.AttemptAnswerId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswerEntity, AttemptAnswerId> {
    List<AttemptAnswerEntity> findByIdAttemptIdOrderByPositionAsc(Long attemptId);
    Optional<AttemptAnswerEntity> findByIdAttemptIdAndIdQuestionId(Long attemptId, Long questionId);
}
