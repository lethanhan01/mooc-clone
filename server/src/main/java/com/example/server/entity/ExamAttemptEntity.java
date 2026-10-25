package com.example.server.entity;

import com.example.server.entity.enums.AttemptMode;
import com.example.server.entity.enums.AttemptStatus;
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

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exam_attempts", schema = "public")
public class ExamAttemptEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private ExamRoomEntity room;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode", length = 10, nullable = false)
    private AttemptMode mode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;

    @Column(name = "started_at", nullable = false)
    private OffsetDateTime startedAt = OffsetDateTime.now(ZoneOffset.UTC);

    @Column(name = "deadline_at", nullable = false)
    private OffsetDateTime deadlineAt;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @Column(name = "graded_at")
    private OffsetDateTime gradedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now(ZoneOffset.UTC);

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<AttemptAnswerEntity> answers = new ArrayList<>();

    public ExamAttemptEntity() {
        // Default constructor required by JPA
    }

    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }
    public ExamRoomEntity getRoom() { return room; }
    public void setRoom(ExamRoomEntity room) { this.room = room; }
    public AttemptMode getMode() { return mode; }
    public void setMode(AttemptMode mode) { this.mode = mode; }
    public AttemptStatus getStatus() { return status; }
    public void setStatus(AttemptStatus status) { this.status = status; }
    public OffsetDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(OffsetDateTime startedAt) { this.startedAt = startedAt; }
    public OffsetDateTime getDeadlineAt() { return deadlineAt; }
    public void setDeadlineAt(OffsetDateTime deadlineAt) { this.deadlineAt = deadlineAt; }
    public OffsetDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(OffsetDateTime submittedAt) { this.submittedAt = submittedAt; }
    public OffsetDateTime getGradedAt() { return gradedAt; }
    public void setGradedAt(OffsetDateTime gradedAt) { this.gradedAt = gradedAt; }
    public List<AttemptAnswerEntity> getAnswers() { return answers; }
    public void setAnswers(List<AttemptAnswerEntity> answers) { this.answers = answers; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
