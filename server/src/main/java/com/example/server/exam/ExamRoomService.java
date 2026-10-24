package com.example.server.exam;

import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Quản lý vòng đời và nghiệp vụ các phòng thi trực tuyến trong bộ nhớ (In-Memory).
 */
@Service
public class ExamRoomService {

    private final Map<String, ExamRoomState> rooms = new ConcurrentHashMap<>();

    public ExamRoomService() {
        // Khởi tạo sẵn một phòng thi mẫu để kiểm thử ngay lập tức
        createRoom("ROOM_DEFAULT", "Phòng Thi Trắc Nghiệm Mẫu 01", 300, 10);
    }

    public ExamRoomState createRoom(String roomId, String roomName, int durationSeconds, int totalQuestions) {
        ExamRoomState room = new ExamRoomState(roomId, roomName, durationSeconds, totalQuestions);
        rooms.put(roomId, room);
        return room;
    }

    public ExamRoomState getRoom(String roomId) {
        return rooms.get(roomId);
    }

    public Collection<ExamRoomState> getAllRooms() {
        return Collections.unmodifiableCollection(rooms.values());
    }

    public ExamRoomState joinRoom(String roomId, String userId, String userName) {
        ExamRoomState room = rooms.get(roomId);
        if (room == null) {
            // Tự động khởi tạo phòng nếu chưa có
            room = createRoom(roomId, "Phòng thi " + roomId, 300, 10);
        }
        room.addParticipant(userId, userName);
        return room;
    }

    public void leaveRoom(String roomId, String userId) {
        ExamRoomState room = rooms.get(roomId);
        if (room != null) {
            room.removeParticipant(userId);
        }
    }

    public void startRoom(String roomId) {
        ExamRoomState room = rooms.get(roomId);
        if (room != null && "WAITING".equals(room.getStatus())) {
            room.setStatus("IN_PROGRESS");
        }
    }

    public void submitAnswer(String roomId, String userId, String questionId, String selectedOption) {
        ExamRoomState room = rooms.get(roomId);
        if (room != null && "IN_PROGRESS".equals(room.getStatus())) {
            room.recordAnswer(userId, questionId, selectedOption);
        }
    }

    public Map<String, Integer> finishExam(String roomId) {
        ExamRoomState room = rooms.get(roomId);
        if (room == null) {
            return Collections.emptyMap();
        }

        room.setStatus("FINISHED");
        room.setTimeRemainingSeconds(0);

        // Chấm điểm cho từng thí sinh (Mỗi câu trả lời được ghi nhận tính điểm cơ sở)
        for (String userId : room.getParticipants().keySet()) {
            Map<String, String> userAnswers = room.getUserAnswers(userId);
            int score = (int) Math.round(((double) userAnswers.size() / Math.max(1, room.getTotalQuestions())) * 10.0);
            room.recordScore(userId, score);
        }

        return room.getScores();
    }
}
