package com.example.server.repository;

import com.example.server.entity.QuestionOptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOptionEntity, Long> {
    List<QuestionOptionEntity> findByQuestionIdOrderByPositionAsc(Long questionId);
    Optional<QuestionOptionEntity> findByQuestionIdAndPosition(Long questionId, short position);
}
