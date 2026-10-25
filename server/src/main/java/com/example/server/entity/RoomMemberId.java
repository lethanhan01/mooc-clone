package com.example.server.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class RoomMemberId implements Serializable {

    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "user_id")
    private Long userId;

    public RoomMemberId() {}

    public RoomMemberId(Long roomId, Long userId) {
        this.roomId = roomId;
        this.userId = userId;
    }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RoomMemberId that)) return false;
        return Objects.equals(roomId, that.roomId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(roomId, userId);
    }
}
