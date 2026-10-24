package com.example.server.exam;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Kiểm thử Nghiệp vụ Phòng Thi Trực Tuyến (ExamRoomService)")
class ExamRoomServiceTest {

    private ExamRoomService roomService;

    @BeforeEach
    void setUp() {
        roomService = new ExamRoomService();
    }

    @Test
    @DisplayName("Khởi tạo phòng thi và kiểm tra cấu hình ban đầu")
    void testCreateRoom() {
        ExamRoomState room = roomService.createRoom("TEST_ROOM_1", "Phòng Toán Học", 600, 20);

        assertThat(room).isNotNull();
        assertThat(room.getRoomId()).isEqualTo("TEST_ROOM_1");
        assertThat(room.getStatus()).isEqualTo("WAITING");
        assertThat(room.getTimeRemainingSeconds()).isEqualTo(600);
        assertThat(room.getTotalQuestions()).isEqualTo(20);
    }

    @Test
    @DisplayName("Thí sinh tham gia và rời khỏi phòng thi")
    void testJoinAndLeaveRoom() {
        roomService.joinRoom("TEST_ROOM_2", "u1", "Nguyễn Văn A");
        roomService.joinRoom("TEST_ROOM_2", "u2", "Trần Thị B");

        ExamRoomState room = roomService.getRoom("TEST_ROOM_2");
        assertThat(room.getParticipantsCount()).isEqualTo(2);
        assertThat(room.getParticipants()).containsEntry("u1", "Nguyễn Văn A");

        roomService.leaveRoom("TEST_ROOM_2", "u1");
        assertThat(room.getParticipantsCount()).isEqualTo(1);
        assertThat(room.getParticipants()).doesNotContainKey("u1");
    }

    @Test
    @DisplayName("Bắt đầu thi, ghi nhận câu trả lời và chấm điểm khi kết thúc")
    void testSubmitAnswerAndFinishExam() {
        String roomId = "TEST_ROOM_3";
        roomService.createRoom(roomId, "Phòng Lịch Sử", 300, 5);
        roomService.joinRoom(roomId, "student_01", "Lê Văn C");
        roomService.startRoom(roomId);

        // Nộp câu trả lời cho 3 câu hỏi
        roomService.submitAnswer(roomId, "student_01", "q1", "A");
        roomService.submitAnswer(roomId, "student_01", "q2", "C");
        roomService.submitAnswer(roomId, "student_01", "q3", "D");

        ExamRoomState room = roomService.getRoom(roomId);
        assertThat(room.getUserAnswers("student_01")).hasSize(3);

        // Kết thúc phòng thi và chấm điểm
        Map<String, Integer> scores = roomService.finishExam(roomId);

        assertThat(room.getStatus()).isEqualTo("FINISHED");
        assertThat(room.getTimeRemainingSeconds()).isEqualTo(0);
        // 3 câu / 5 câu * 10 điểm = 6 điểm
        assertThat(scores.get("student_01")).isEqualTo(6);
    }
}
