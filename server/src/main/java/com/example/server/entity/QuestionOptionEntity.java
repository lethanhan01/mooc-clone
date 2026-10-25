package com.example.server.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "question_options", schema = "public")
public class QuestionOptionEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuestionEntity question;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "position", nullable = false)
    private short position;

    @Column(name = "is_correct", nullable = false)
    private boolean isCorrect = false;

    public QuestionOptionEntity() {
        // Default constructor required by JPA
    }

    public QuestionOptionEntity(QuestionEntity question, String content, short position, boolean isCorrect) {
        this.question = question;
        this.content = content;
        this.position = position;
        this.isCorrect = isCorrect;
    }

    public QuestionEntity getQuestion() { return question; }
    public void setQuestion(QuestionEntity question) { this.question = question; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public short getPosition() { return position; }
    public void setPosition(short position) { this.position = position; }
    public boolean isCorrect() { return isCorrect; }
    public void setCorrect(boolean correct) { isCorrect = correct; }
}
