package com.example.server.repository;

import com.example.server.entity.QuestionEntity;
import com.example.server.entity.enums.DifficultyLevel;
import com.example.server.entity.enums.QuestionStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends BaseRepository<QuestionEntity, Long> {
    @Override
    @EntityGraph(attributePaths = {"options"})
    List<QuestionEntity> findAll();

    List<QuestionEntity> findByTopicAndDifficultyAndStatus(String topic, DifficultyLevel difficulty, QuestionStatus status);
    List<QuestionEntity> findByStatus(QuestionStatus status);

    @EntityGraph(attributePaths = {"options"})
    List<QuestionEntity> findByTopicAndStatus(String topic, QuestionStatus status);
}
