package com.example.server.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class AttemptAnswerId implements Serializable {

    @Column(name = "attempt_id")
    private Long attemptId;

    @Column(name = "question_id")
    private Long questionId;

    public AttemptAnswerId() {}

    public AttemptAnswerId(Long attemptId, Long questionId) {
        this.attemptId = attemptId;
        this.questionId = questionId;
    }

    public Long getAttemptId() { return attemptId; }
    public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }
    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AttemptAnswerId that)) return false;
        return Objects.equals(attemptId, that.attemptId) && Objects.equals(questionId, that.questionId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(attemptId, questionId);
    }
}
