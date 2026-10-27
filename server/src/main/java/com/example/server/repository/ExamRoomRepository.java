package com.example.server.repository;

import com.example.server.entity.ExamRoomEntity;
import com.example.server.entity.enums.RoomStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRoomRepository extends BaseRepository<ExamRoomEntity, Long> {
    @Override
    @EntityGraph(attributePaths = {"owner"})
    List<ExamRoomEntity> findAll();

    @EntityGraph(attributePaths = {"owner"})
    Optional<ExamRoomEntity> findByRoomCode(String roomCode);

    boolean existsByRoomCode(String roomCode);
    List<ExamRoomEntity> findByStatus(RoomStatus status);
    List<ExamRoomEntity> findByOwnerId(Long ownerId);
}
