package com.example.server.service;

import com.example.server.dto.room.CreateRoomRequest;
import com.example.server.dto.room.RoomDetailResponse;
import com.example.server.dto.room.RoomSummaryDto;
import com.example.server.entity.ExamRoomEntity;

import java.util.Map;
import java.util.Optional;

public interface RoomService extends BaseService<ExamRoomEntity, Long, CreateRoomRequest, RoomSummaryDto> {
    RoomSummaryDto joinRoom(String roomCode, String usernameOrId, String displayName);
    void leaveRoom(String roomCode, String usernameOrId);
    Optional<RoomSummaryDto> getRoomSummary(String roomCode);
    RoomDetailResponse getRoomDetail(String roomCode);
    void startRoom(String roomCode);
    Map<String, Integer> finishRoom(String roomCode);
}
