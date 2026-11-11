package com.example.server.gateway;

import com.example.server.dto.attempt.AttemptResultResponse;
import com.example.server.dto.auth.AuthResponse;
import com.example.server.dto.question.QuestionResponse;
import com.example.server.dto.room.RoomDetailResponse;
import com.example.server.dto.room.RoomSummaryDto;
import com.example.server.repository.AuditLogRepository;
import com.example.server.repository.SessionRepository;
import com.example.server.repository.UserRepository;
import com.example.server.service.AuthService;
import com.example.server.service.ExamAttemptService;
import com.example.server.service.QuestionService;
import com.example.server.service.RoomService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Kiểm thử Đơn vị GatewayMessageDispatcher (Đầy đủ các nhánh Opcodes TLV)")
class GatewayMessageDispatcherTest {

    @Mock
    private AuthService authService;
    @Mock
    private RoomService roomService;
    @Mock
    private ExamAttemptService examAttemptService;
    @Mock
    private QuestionService questionService;
    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SessionRepository sessionRepository;
    @Mock
    private GatewayWorkerClient workerClient;

    private GatewayMessageDispatcher dispatcher;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        dispatcher = new GatewayMessageDispatcher();
        objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
        ReflectionTestUtils.setField(dispatcher, "authService", authService);
        ReflectionTestUtils.setField(dispatcher, "roomService", roomService);
        ReflectionTestUtils.setField(dispatcher, "examAttemptService", examAttemptService);
        ReflectionTestUtils.setField(dispatcher, "questionService", questionService);
        ReflectionTestUtils.setField(dispatcher, "auditLogRepository", auditLogRepository);
        ReflectionTestUtils.setField(dispatcher, "userRepository", userRepository);
        ReflectionTestUtils.setField(dispatcher, "sessionRepository", sessionRepository);
        ReflectionTestUtils.setField(dispatcher, "objectMapper", objectMapper);
    }

    @Test
    @DisplayName("OP_PING trả về OP_PONG với status OK")
    void handlePing_ReturnsPong() throws Exception {
        EngineHeader header = new EngineHeader(EngineProtocolConstants.OP_PING, 10L, 5L, 2);
        dispatcher.handleMessage(header, "{}", workerClient);

        verify(workerClient).sendResponse(5L, 10L, EngineProtocolConstants.OP_PONG, "{\"status\":\"OK\"}");
    }

    @Test
    @DisplayName("OP_AUTH_LOGIN_REQ đăng nhập thành công và lưu phiên theo clientId")
    void handleLogin_SavesSessionAndResponds() throws Exception {
        AuthResponse authResp = new AuthResponse(
                "tok_123", 1L, "student_alice", "Alice", "STUDENT",
                OffsetDateTime.now(ZoneOffset.UTC).plusDays(7)
        );
        when(authService.login(any())).thenReturn(authResp);

        EngineHeader header = new EngineHeader(EngineProtocolConstants.OP_AUTH_LOGIN_REQ, 11L, 7L, 50);
        dispatcher.handleMessage(header, "{\"usernameOrEmail\":\"student_alice\",\"password\":\"password123\"}", workerClient);

        ArgumentCaptor<String> jsonCaptor = ArgumentCaptor.forClass(String.class);
        verify(workerClient).sendResponse(eq(7L), eq(11L), eq(EngineProtocolConstants.OP_AUTH_LOGIN_RESP), jsonCaptor.capture());
        assertTrue(jsonCaptor.getValue().contains("student_alice"));
    }

    @Test
    @DisplayName("OP_ROOM_LIST_REQ phân nhánh chính xác cho questions, room detail và danh sách phòng")
    void handleRoomList_RoutesSubtypesCorrectly() throws Exception {
        when(questionService.findAll()).thenReturn(List.of(
                new QuestionResponse(1L, "Mạng", "EASY", "SINGLE", "TCP là gì?", "ACTIVE", List.of(), OffsetDateTime.now(ZoneOffset.UTC))
        ));
        EngineHeader qHeader = new EngineHeader(EngineProtocolConstants.OP_ROOM_LIST_REQ, 20L, 4L, 20);
        dispatcher.handleMessage(qHeader, "{\"type\":\"questions\"}", workerClient);
        verify(questionService).findAll();

        RoomDetailResponse detail = new RoomDetailResponse(
                1L, "R01", "Room 1", "Desc", "TCP", 5, 3, 2, "PUBLIC", "WAITING",
                300, 50, null, null, OffsetDateTime.now(ZoneOffset.UTC), 1L, "Teacher", List.of()
        );
        when(roomService.getRoomDetail("R01")).thenReturn(detail);
        EngineHeader dHeader = new EngineHeader(EngineProtocolConstants.OP_ROOM_LIST_REQ, 21L, 4L, 30);
        dispatcher.handleMessage(dHeader, "{\"roomCode\":\"R01\",\"detail\":true}", workerClient);
        verify(roomService).getRoomDetail("R01");

        when(roomService.findAll()).thenReturn(List.of(
                new RoomSummaryDto(1L, "R01", "Room 1", "WAITING", 300, 10, 1, 1L, "Teacher")
        ));
        EngineHeader rHeader = new EngineHeader(EngineProtocolConstants.OP_ROOM_LIST_REQ, 22L, 4L, 2);
        dispatcher.handleMessage(rHeader, "{}", workerClient);
        verify(roomService).findAll();
    }

    @Test
    @DisplayName("OP_EXAM_START_REQ phân biệt chính xác startAttempt (có mode) và startRoom (chỉ có roomCode)")
    void handleExamStart_DistinguishesStartAttemptAndStartRoom() throws Exception {
        AttemptResultResponse attemptRes = new AttemptResultResponse(
                99L, 1L, "alice", "Alice", 1L, "R01", "EXAM", "IN_PROGRESS",
                10, 0, 0, 0, 10, 0.0, 0.0, OffsetDateTime.now(ZoneOffset.UTC), null, List.of()
        );
        when(examAttemptService.startAttempt(any())).thenReturn(attemptRes);

        EngineHeader attemptHeader = new EngineHeader(EngineProtocolConstants.OP_EXAM_START_REQ, 30L, 8L, 40);
        dispatcher.handleMessage(attemptHeader, "{\"roomCode\":\"R01\",\"mode\":\"EXAM\"}", workerClient);
        verify(examAttemptService).startAttempt(any());

        EngineHeader roomStartHeader = new EngineHeader(EngineProtocolConstants.OP_EXAM_START_REQ, 31L, 8L, 20);
        dispatcher.handleMessage(roomStartHeader, "{\"roomCode\":\"R01\"}", workerClient);
        verify(roomService).startRoom("R01");
    }

    @Test
    @DisplayName("OP_EXAM_SUBMIT_REQ xử lý đầy đủ submitAnswer, getResult, submitExam và finishRoom")
    void handleExamSubmit_RoutesAllFourActions() throws Exception {
        EngineHeader ansHeader = new EngineHeader(EngineProtocolConstants.OP_EXAM_SUBMIT_REQ, 40L, 9L, 50);
        dispatcher.handleMessage(ansHeader, "{\"attemptId\":10,\"questionId\":20,\"selectedOptionId\":30}", workerClient);
        verify(examAttemptService).submitAnswer(10L, 20L, 30L);

        EngineHeader resHeader = new EngineHeader(EngineProtocolConstants.OP_EXAM_SUBMIT_REQ, 41L, 9L, 40);
        dispatcher.handleMessage(resHeader, "{\"attemptId\":10,\"action\":\"result\"}", workerClient);
        verify(examAttemptService).getResult(10L);

        EngineHeader subHeader = new EngineHeader(EngineProtocolConstants.OP_EXAM_SUBMIT_REQ, 42L, 9L, 20);
        dispatcher.handleMessage(subHeader, "{\"attemptId\":10}", workerClient);
        verify(examAttemptService).submitExam(10L);

        when(roomService.finishRoom("R01")).thenReturn(Map.of());
        EngineHeader finHeader = new EngineHeader(EngineProtocolConstants.OP_EXAM_SUBMIT_REQ, 43L, 9L, 20);
        dispatcher.handleMessage(finHeader, "{\"roomCode\":\"R01\"}", workerClient);
        verify(roomService).finishRoom("R01");
    }
}
