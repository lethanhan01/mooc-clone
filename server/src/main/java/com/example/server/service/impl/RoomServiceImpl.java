package com.example.server.service.impl;

import com.example.server.dto.room.CreateRoomRequest;
import com.example.server.dto.room.RoomDetailResponse;
import com.example.server.dto.room.RoomSummaryDto;
import com.example.server.entity.ExamRoomEntity;
import com.example.server.entity.RoomMemberEntity;
import com.example.server.entity.RoomMemberId;
import com.example.server.entity.UserEntity;
import com.example.server.entity.enums.RoomStatus;
import com.example.server.exception.AppException;
import com.example.server.exception.ErrorCode;
import com.example.server.repository.ExamRoomRepository;
import com.example.server.repository.RoomMemberRepository;
import com.example.server.repository.UserRepository;
import com.example.server.service.RoomService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class RoomServiceImpl extends BaseServiceImpl<ExamRoomEntity, Long, CreateRoomRequest, RoomSummaryDto, ExamRoomRepository>
        implements RoomService {

    private final RoomMemberRepository memberRepository;
    private final UserRepository userRepository;

    public RoomServiceImpl(ExamRoomRepository roomRepository,
                           RoomMemberRepository memberRepository,
                           UserRepository userRepository) {
        super(roomRepository);
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    @Override
    public RoomSummaryDto joinRoom(String roomCode, String usernameOrId, String displayName) {
        String safeRoomCode = roomCode.length() > 12 ? roomCode.substring(0, 12) : roomCode;

        // 1. Kiểm tra User bắt buộc phải tồn tại trong CSDL
        UserEntity user = userRepository.findByUsername(usernameOrId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED, "Không tìm thấy người dùng: " + usernameOrId));

        // 2. Kiểm tra ExamRoom bắt buộc phải tồn tại trong CSDL
        ExamRoomEntity room = repository.findByRoomCode(safeRoomCode)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND, "Không tìm thấy phòng thi với mã: " + safeRoomCode));

        if (room.getStatus() == RoomStatus.ENDED || room.getStatus() == RoomStatus.CANCELLED) {
            throw new AppException(ErrorCode.ROOM_ALREADY_ENDED, "Phòng thi đã kết thúc hoặc bị hủy");
        }

        int currentParticipants = memberRepository.findByIdRoomId(room.getId()).size();
        if (room.getMaxParticipants() != null && currentParticipants >= room.getMaxParticipants()) {
            throw new AppException(ErrorCode.ROOM_FULL, "Phòng thi đã đầy");
        }

        if (!memberRepository.existsByIdRoomIdAndIdUserId(room.getId(), user.getId())) {
            RoomMemberEntity member = new RoomMemberEntity(room, user);
            memberRepository.save(member);
        }

        return toResponseDto(room);
    }

    @Override
    public void leaveRoom(String roomCode, String usernameOrId) {
        String safeRoomCode = roomCode.length() > 12 ? roomCode.substring(0, 12) : roomCode;
        Optional<ExamRoomEntity> roomOpt = repository.findByRoomCode(safeRoomCode);
        Optional<UserEntity> userOpt = userRepository.findByUsername(usernameOrId);

        if (roomOpt.isPresent() && userOpt.isPresent()) {
            RoomMemberId memberId = new RoomMemberId(roomOpt.get().getId(), userOpt.get().getId());
            memberRepository.findById(memberId).ifPresent(memberRepository::delete);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RoomSummaryDto> getRoomSummary(String roomCode) {
        String safeRoomCode = roomCode.length() > 12 ? roomCode.substring(0, 12) : roomCode;
        return repository.findByRoomCode(safeRoomCode).map(this::toResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomDetailResponse getRoomDetail(String roomCode) {
        String safeRoomCode = roomCode.length() > 12 ? roomCode.substring(0, 12) : roomCode;
        ExamRoomEntity room = repository.findByRoomCode(safeRoomCode)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND, "Không tìm thấy phòng thi: " + safeRoomCode));

        List<String> participantUsernames = memberRepository.findByIdRoomId(room.getId()).stream()
                .map(m -> m.getUser().getUsername())
                .toList();

        return new RoomDetailResponse(
                room.getId(),
                room.getRoomCode(),
                room.getName(),
                room.getDescription(),
                room.getTopic(),
                room.getEasyCount(),
                room.getMediumCount(),
                room.getHardCount(),
                room.getVisibility().name(),
                room.getStatus().name(),
                room.getDurationSeconds(),
                room.getMaxParticipants(),
                room.getStartedAt(),
                room.getEndsAt(),
                room.getOwner().getId(),
                room.getOwner().getDisplayName(),
                participantUsernames
        );
    }

    @Override
    public void startRoom(String roomCode) {
        String safeRoomCode = roomCode.length() > 12 ? roomCode.substring(0, 12) : roomCode;
        ExamRoomEntity room = repository.findByRoomCode(safeRoomCode)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND, "Không tìm thấy phòng thi: " + safeRoomCode));

        if (room.getStatus() == RoomStatus.WAITING) {
            room.setStatus(RoomStatus.RUNNING);
            OffsetDateTime now = OffsetDateTime.now();
            room.setStartedAt(now);
            room.setEndsAt(now.plusSeconds(room.getDurationSeconds()));
            repository.save(room);
        }
    }

    @Override
    public Map<String, Integer> finishRoom(String roomCode) {
        String safeRoomCode = roomCode.length() > 12 ? roomCode.substring(0, 12) : roomCode;
        return repository.findByRoomCode(safeRoomCode).map(room -> {
            room.setStatus(RoomStatus.ENDED);
            room.setEndedAt(OffsetDateTime.now());
            repository.save(room);
            return Collections.<String, Integer>emptyMap();
        }).orElse(Collections.emptyMap());
    }

    @Override
    protected ExamRoomEntity toEntity(CreateRoomRequest request) {
        if (repository.existsByRoomCode(request.roomCode())) {
            throw new AppException(ErrorCode.INVALID_KEY, "Mã phòng đã tồn tại: " + request.roomCode());
        }

        ExamRoomEntity entity = new ExamRoomEntity();
        entity.setRoomCode(request.roomCode());
        entity.setName(request.name());
        entity.setDescription(request.description());
        entity.setTopic(request.topic());
        entity.setEasyCount(request.easyCount());
        entity.setMediumCount(request.mediumCount());
        entity.setHardCount(request.hardCount());
        entity.setVisibility(request.visibility());
        entity.setDurationSeconds(request.durationSeconds());
        entity.setMaxParticipants(request.maxParticipants());
        entity.setStatus(RoomStatus.WAITING);

        // Fallback default owner (Admin / System)
        UserEntity defaultOwner = userRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED, "Chưa có tài khoản khởi tạo để làm chủ phòng"));
        entity.setOwner(defaultOwner);

        return entity;
    }

    @Override
    protected RoomSummaryDto toResponseDto(ExamRoomEntity room) {
        int count = memberRepository.findByIdRoomId(room.getId()).size();
        return new RoomSummaryDto(
                room.getId(),
                room.getRoomCode(),
                room.getName(),
                room.getStatus().name(),
                room.getDurationSeconds(),
                room.getEasyCount() + room.getMediumCount() + room.getHardCount(),
                count,
                room.getOwner() != null ? room.getOwner().getId() : null,
                room.getOwner() != null ? room.getOwner().getDisplayName() : "Unknown"
        );
    }

    @Override
    protected void updateEntityFromDto(CreateRoomRequest request, ExamRoomEntity entity) {
        if (request.name() != null) entity.setName(request.name());
        if (request.description() != null) entity.setDescription(request.description());
        if (request.topic() != null) entity.setTopic(request.topic());
        entity.setEasyCount(request.easyCount());
        entity.setMediumCount(request.mediumCount());
        entity.setHardCount(request.hardCount());
        if (request.visibility() != null) entity.setVisibility(request.visibility());
        entity.setDurationSeconds(request.durationSeconds());
        if (request.maxParticipants() != null) entity.setMaxParticipants(request.maxParticipants());
    }
}
