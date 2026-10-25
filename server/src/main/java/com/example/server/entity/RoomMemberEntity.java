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
@Table(name = "room_members", schema = "public")
public class RoomMemberEntity {

    @EmbeddedId
    private RoomMemberId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("roomId")
    @JoinColumn(name = "room_id", nullable = false)
    private ExamRoomEntity room;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "joined_at", nullable = false)
    private OffsetDateTime joinedAt = OffsetDateTime.now();

    public RoomMemberEntity() {}

    public RoomMemberEntity(ExamRoomEntity room, UserEntity user) {
        this.room = room;
        this.user = user;
        this.id = new RoomMemberId(room.getId(), user.getId());
    }

    public RoomMemberId getId() { return id; }
    public void setId(RoomMemberId id) { this.id = id; }
    public ExamRoomEntity getRoom() { return room; }
    public void setRoom(ExamRoomEntity room) { this.room = room; }
    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }
    public OffsetDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(OffsetDateTime joinedAt) { this.joinedAt = joinedAt; }
}
