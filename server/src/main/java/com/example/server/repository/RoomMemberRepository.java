package com.example.server.repository;

import com.example.server.entity.RoomMemberEntity;
import com.example.server.entity.RoomMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomMemberRepository extends JpaRepository<RoomMemberEntity, RoomMemberId> {
    List<RoomMemberEntity> findByIdRoomId(Long roomId);
    List<RoomMemberEntity> findByIdUserId(Long userId);
    boolean existsByIdRoomIdAndIdUserId(Long roomId, Long userId);
}
