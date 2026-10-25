package com.example.server.entity;

import com.example.server.entity.enums.DifficultyLevel;
import com.example.server.entity.enums.QuestionStatus;
import com.example.server.entity.enums.QuestionType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions", schema = "public")
public class QuestionEntity extends AuditableEntity {

    @Column(name = "topic", length = 100, nullable = false)
    private String topic;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty", length = 20, nullable = false)
    private DifficultyLevel difficulty;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", length = 30, nullable = false)
    private QuestionType questionType = QuestionType.SINGLE_CHOICE;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 16, nullable = false)
    private QuestionStatus status = QuestionStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserEntity createdBy;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<QuestionOptionEntity> options = new ArrayList<>();

    public QuestionEntity() {
        // Default constructor required by JPA
    }

    public QuestionEntity(String topic, DifficultyLevel difficulty, String content, UserEntity createdBy) {
        this.topic = topic;
        this.difficulty = difficulty;
        this.content = content;
        this.createdBy = createdBy;
    }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public DifficultyLevel getDifficulty() { return difficulty; }
    public void setDifficulty(DifficultyLevel difficulty) { this.difficulty = difficulty; }
    public QuestionType getQuestionType() { return questionType; }
    public void setQuestionType(QuestionType questionType) { this.questionType = questionType; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public QuestionStatus getStatus() { return status; }
    public void setStatus(QuestionStatus status) { this.status = status; }
    public UserEntity getCreatedBy() { return createdBy; }
    public void setCreatedBy(UserEntity createdBy) { this.createdBy = createdBy; }
    public List<QuestionOptionEntity> getOptions() { return options; }
    public void setOptions(List<QuestionOptionEntity> options) { this.options = options; }
}
