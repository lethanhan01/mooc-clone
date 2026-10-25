package com.example.server.repository;

import com.example.server.entity.ExamRoomEntity;
import com.example.server.entity.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRoomRepository extends JpaRepository<ExamRoomEntity, Long> {
    Optional<ExamRoomEntity> findByRoomCode(String roomCode);
    boolean existsByRoomCode(String roomCode);
    List<ExamRoomEntity> findByStatus(RoomStatus status);
    List<ExamRoomEntity> findByOwnerId(Long ownerId);
}
