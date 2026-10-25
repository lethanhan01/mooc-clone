package com.example.server.service;

import com.example.server.dto.room.RoomSummaryDto;
import com.example.server.entity.ExamRoomEntity;
import com.example.server.entity.UserEntity;
import com.example.server.entity.enums.RoomStatus;
import com.example.server.entity.enums.RoomVisibility;
import com.example.server.entity.enums.SystemRole;
import com.example.server.entity.enums.UserStatus;
import com.example.server.exception.AppException;
import com.example.server.exception.ErrorCode;
import com.example.server.repository.ExamRoomRepository;
import com.example.server.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(properties = "socket.tcp.port=0")
class RoomServiceTest {

    @Autowired
    private RoomService roomService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExamRoomRepository examRoomRepository;

    private UserEntity testUser;
    private ExamRoomEntity testRoom;

    @BeforeEach
    void setUp() {
        testUser = userRepository.findByUsername("student_test_01").orElseGet(() -> {
            UserEntity u = new UserEntity();
            u.setUsername("student_test_01");
            u.setDisplayName("Nguyễn Văn Test");
            u.setEmail("student_test_01@mooc.local");
            u.setPasswordHash("$2a$10$dummyHashPass");
            u.setSystemRole(SystemRole.USER);
            u.setStatus(UserStatus.ACTIVE);
            return userRepository.save(u);
        });

        testRoom = examRoomRepository.findByRoomCode("ROOM_TEST_01").orElseGet(() -> {
            ExamRoomEntity r = new ExamRoomEntity();
            r.setRoomCode("ROOM_TEST_01");
            r.setName("Phòng thi ROOM_TEST_01");
            r.setDescription("Mô tả test phòng thi");
            r.setOwner(testUser);
            r.setTopic("Lập Trình Mạng");
            r.setEasyCount(5);
            r.setMediumCount(3);
            r.setHardCount(2);
            r.setVisibility(RoomVisibility.PUBLIC);
            r.setStatus(RoomStatus.WAITING);
            r.setDurationSeconds(300);
            return examRoomRepository.save(r);
        });
    }

    @Test
    @DisplayName("Kiểm tra tham gia phòng thi với dữ liệu tồn tại và tra cứu RoomSummaryDto")
    void testJoinAndGetRoomSummary() {
        String testRoomCode = testRoom.getRoomCode();
        String testUsername = testUser.getUsername();

        RoomSummaryDto joined = roomService.joinRoom(testRoomCode, testUsername, "Nguyễn Văn Test");
        assertNotNull(joined);
        assertEquals(testRoomCode, joined.roomCode());
        assertEquals("WAITING", joined.status());
        assertTrue(joined.participantsCount() >= 1);
        assertEquals(10, joined.totalQuestions()); // 5 easy + 3 medium + 2 hard

        Optional<RoomSummaryDto> retrieved = roomService.getRoomSummary(testRoomCode);
        assertTrue(retrieved.isPresent());
        assertEquals(joined.roomCode(), retrieved.get().roomCode());
    }

    @Test
    @DisplayName("Kiểm tra vòng đời phòng thi: Start và Finish phòng thi trên CSDL Supabase")
    void testRoomLifecycle() {
        String testRoomCode = "LC_" + (System.currentTimeMillis() % 1000000);
        ExamRoomEntity lifecycleRoom = new ExamRoomEntity();
        lifecycleRoom.setRoomCode(testRoomCode);
        lifecycleRoom.setName("Lifecycle Room " + testRoomCode);
        lifecycleRoom.setDescription("Phòng thi lifecycle");
        lifecycleRoom.setOwner(testUser);
        lifecycleRoom.setTopic("Lập Trình Mạng");
        lifecycleRoom.setEasyCount(5);
        lifecycleRoom.setMediumCount(3);
        lifecycleRoom.setHardCount(2);
        lifecycleRoom.setVisibility(RoomVisibility.PUBLIC);
        lifecycleRoom.setStatus(RoomStatus.WAITING);
        lifecycleRoom.setDurationSeconds(300);
        examRoomRepository.save(lifecycleRoom);

        roomService.joinRoom(testRoomCode, testUser.getUsername(), "Thí sinh LC");

        roomService.startRoom(testRoomCode);
        Optional<RoomSummaryDto> runningRoom = roomService.getRoomSummary(testRoomCode);
        assertTrue(runningRoom.isPresent());
        assertEquals("RUNNING", runningRoom.get().status());

        roomService.finishRoom(testRoomCode);
        Optional<RoomSummaryDto> finishedRoom = roomService.getRoomSummary(testRoomCode);
        assertTrue(finishedRoom.isPresent());
        assertEquals("ENDED", finishedRoom.get().status());
    }

    @Test
    @DisplayName("Ném ngoại lệ USER_NOT_EXISTED khi thí sinh chưa đăng ký cố tham gia phòng")
    void testJoinRoomUserNotExisted() {
        assertThatThrownBy(() -> roomService.joinRoom(testRoom.getRoomCode(), "ghost_user_9999", "Ghost"))
                .isInstanceOf(AppException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_EXISTED);
    }

    @Test
    @DisplayName("Ném ngoại lệ ROOM_NOT_FOUND khi mã phòng không tồn tại trong hệ thống")
    void testJoinRoomNotFound() {
        assertThatThrownBy(() -> roomService.joinRoom("GHOST_ROOM", testUser.getUsername(), testUser.getDisplayName()))
                .isInstanceOf(AppException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ROOM_NOT_FOUND);
    }
}
