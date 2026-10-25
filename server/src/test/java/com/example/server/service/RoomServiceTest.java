package com.example.server.service;

import com.example.server.dto.room.RoomSummaryDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class RoomServiceTest {

    @Autowired
    private RoomService roomService;

    @Test
    @DisplayName("Kiểm tra tham gia phòng thi, tự động khởi tạo User/Room và tra cứu RoomSummaryDto")
    void testJoinAndGetRoomSummary() {
        String testRoomCode = "ROOM_TEST_01";
        String testUsername = "student_test_01";

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
        String testUsername = "u_lc_" + (System.currentTimeMillis() % 10000);
        roomService.joinRoom(testRoomCode, testUsername, "Thí sinh LC");

        roomService.startRoom(testRoomCode);
        Optional<RoomSummaryDto> runningRoom = roomService.getRoomSummary(testRoomCode);
        assertTrue(runningRoom.isPresent());
        assertEquals("RUNNING", runningRoom.get().status());

        roomService.finishRoom(testRoomCode);
        Optional<RoomSummaryDto> finishedRoom = roomService.getRoomSummary(testRoomCode);
        assertTrue(finishedRoom.isPresent());
        assertEquals("ENDED", finishedRoom.get().status());
    }
}
