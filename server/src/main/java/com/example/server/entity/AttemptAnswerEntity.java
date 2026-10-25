package com.example.server.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "attempt_answers", schema = "public")
public class AttemptAnswerEntity {

    @EmbeddedId
    private AttemptAnswerId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("attemptId")
    @JoinColumn(name = "attempt_id", nullable = false)
    private ExamAttemptEntity attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("questionId")
    @JoinColumn(name = "question_id", nullable = false)
    private QuestionEntity question;

    @Column(name = "position", nullable = false)
    private int position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_option_id")
    private QuestionOptionEntity selectedOption;

    @Column(name = "answered_at")
    private OffsetDateTime answeredAt;

    public AttemptAnswerEntity() {}

    public AttemptAnswerEntity(ExamAttemptEntity attempt, QuestionEntity question, int position) {
        this.attempt = attempt;
        this.question = question;
        this.position = position;
        this.id = new AttemptAnswerId(attempt.getId(), question.getId());
    }

    public AttemptAnswerId getId() { return id; }
    public void setId(AttemptAnswerId id) { this.id = id; }
    public ExamAttemptEntity getAttempt() { return attempt; }
    public void setAttempt(ExamAttemptEntity attempt) { this.attempt = attempt; }
    public QuestionEntity getQuestion() { return question; }
    public void setQuestion(QuestionEntity question) { this.question = question; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
    public QuestionOptionEntity getSelectedOption() { return selectedOption; }
    public void setSelectedOption(QuestionOptionEntity selectedOption) { this.selectedOption = selectedOption; }
    public OffsetDateTime getAnsweredAt() { return answeredAt; }
    public void setAnsweredAt(OffsetDateTime answeredAt) { this.answeredAt = answeredAt; }
}
