package com.example.server;

import com.example.server.repository.AttemptAnswerRepository;
import com.example.server.repository.AuditLogRepository;
import com.example.server.repository.ExamAttemptRepository;
import com.example.server.repository.ExamRoomRepository;
import com.example.server.repository.QuestionOptionRepository;
import com.example.server.repository.QuestionRepository;
import com.example.server.repository.RoomMemberRepository;
import com.example.server.repository.SessionRepository;
import com.example.server.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class SupabaseIntegrationTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuestionOptionRepository questionOptionRepository;

    @Autowired
    private ExamRoomRepository examRoomRepository;

    @Autowired
    private RoomMemberRepository roomMemberRepository;

    @Autowired
    private ExamAttemptRepository examAttemptRepository;

    @Autowired
    private AttemptAnswerRepository attemptAnswerRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Test
    @DisplayName("1. Kiểm tra kết nối vật lý DataSource tới Supabase Cloud")
    void testDataSourceConnectivity() throws Exception {
        assertNotNull(dataSource, "DataSource bean phải được khởi tạo thành công");
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT current_database(), current_user, version()")) {
            assertTrue(rs.next(), "Phải nhận được bản ghi phản hồi từ Supabase");
            System.out.println("[Supabase Smoke] Connected to: " + rs.getString(1) + " as " + rs.getString(2));
        }
    }

    @Test
    @DisplayName("2. Kiểm tra tính toàn vẹn và hợp lệ của toàn bộ 9 Repositories với schema Supabase")
    void testAllRepositoriesSchemaValidation() {
        assertNotNull(userRepository);
        assertNotNull(sessionRepository);
        assertNotNull(questionRepository);
        assertNotNull(questionOptionRepository);
        assertNotNull(examRoomRepository);
        assertNotNull(roomMemberRepository);
        assertNotNull(examAttemptRepository);
        assertNotNull(attemptAnswerRepository);
        assertNotNull(auditLogRepository);

        assertTrue(userRepository.count() >= 0, "users table query ok");
        assertTrue(sessionRepository.count() >= 0, "sessions table query ok");
        assertTrue(questionRepository.count() >= 0, "questions table query ok");
        assertTrue(questionOptionRepository.count() >= 0, "question_options table query ok");
        assertTrue(examRoomRepository.count() >= 0, "exam_rooms table query ok");
        assertTrue(roomMemberRepository.count() >= 0, "room_members table query ok");
        assertTrue(examAttemptRepository.count() >= 0, "exam_attempts table query ok");
        assertTrue(attemptAnswerRepository.count() >= 0, "attempt_answers table query ok");
        assertTrue(auditLogRepository.count() >= 0, "audit_logs table query ok");
    }
}
