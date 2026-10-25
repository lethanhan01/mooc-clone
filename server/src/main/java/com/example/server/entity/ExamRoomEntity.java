package com.example.server.entity;

import com.example.server.entity.enums.RoomStatus;
import com.example.server.entity.enums.RoomVisibility;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exam_rooms", schema = "public")
public class ExamRoomEntity extends AuditableEntity {

    @Column(name = "room_code", length = 12, nullable = false)
    private String roomCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private UserEntity owner;

    @Column(name = "name", length = 120, nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "topic", length = 100)
    private String topic;

    @Column(name = "easy_count", nullable = false)
    private int easyCount = 0;

    @Column(name = "medium_count", nullable = false)
    private int mediumCount = 0;

    @Column(name = "hard_count", nullable = false)
    private int hardCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", length = 10, nullable = false)
    private RoomVisibility visibility = RoomVisibility.PUBLIC;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 16, nullable = false)
    private RoomStatus status = RoomStatus.WAITING;

    @Column(name = "duration_seconds", nullable = false)
    private int durationSeconds;

    @Column(name = "max_participants")
    private Integer maxParticipants;

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "ends_at")
    private OffsetDateTime endsAt;

    @Column(name = "ended_at")
    private OffsetDateTime endedAt;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomMemberEntity> members = new ArrayList<>();

    public ExamRoomEntity() {
        // Default constructor required by JPA
    }

    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
    public UserEntity getOwner() { return owner; }
    public void setOwner(UserEntity owner) { this.owner = owner; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public int getEasyCount() { return easyCount; }
    public void setEasyCount(int easyCount) { this.easyCount = easyCount; }
    public int getMediumCount() { return mediumCount; }
    public void setMediumCount(int mediumCount) { this.mediumCount = mediumCount; }
    public int getHardCount() { return hardCount; }
    public void setHardCount(int hardCount) { this.hardCount = hardCount; }
    public RoomVisibility getVisibility() { return visibility; }
    public void setVisibility(RoomVisibility visibility) { this.visibility = visibility; }
    public RoomStatus getStatus() { return status; }
    public void setStatus(RoomStatus status) { this.status = status; }
    public int getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; }
    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }
    public OffsetDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(OffsetDateTime startedAt) { this.startedAt = startedAt; }
    public OffsetDateTime getEndsAt() { return endsAt; }
    public void setEndsAt(OffsetDateTime endsAt) { this.endsAt = endsAt; }
    public OffsetDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(OffsetDateTime endedAt) { this.endedAt = endedAt; }
    public List<RoomMemberEntity> getMembers() { return members; }
    public void setMembers(List<RoomMemberEntity> members) { this.members = members; }
}
