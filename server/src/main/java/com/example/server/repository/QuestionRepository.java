package com.example.server.repository;

import com.example.server.entity.QuestionEntity;
import com.example.server.entity.enums.DifficultyLevel;
import com.example.server.entity.enums.QuestionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<QuestionEntity, Long> {
    List<QuestionEntity> findByTopicAndDifficultyAndStatus(String topic, DifficultyLevel difficulty, QuestionStatus status);
    List<QuestionEntity> findByStatus(QuestionStatus status);
    List<QuestionEntity> findByTopicAndStatus(String topic, QuestionStatus status);
}
