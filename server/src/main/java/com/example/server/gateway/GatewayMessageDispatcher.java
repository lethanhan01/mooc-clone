package com.example.server.gateway;

import com.example.server.dto.attempt.AttemptResultResponse;
import com.example.server.dto.attempt.StartAttemptRequest;
import com.example.server.dto.audit.AuditLogResponse;
import com.example.server.dto.auth.AuthResponse;
import com.example.server.dto.auth.LoginRequest;
import com.example.server.dto.auth.RegisterRequest;
import com.example.server.dto.auth.UserProfileResponse;
import com.example.server.dto.question.CreateQuestionRequest;
import com.example.server.dto.question.QuestionResponse;
import com.example.server.dto.room.CreateRoomRequest;
import com.example.server.dto.room.RoomDetailResponse;
import com.example.server.dto.room.RoomSummaryDto;
import com.example.server.dto.room.UpdateRoomRequest;
import com.example.server.entity.AuditLogEntity;
import com.example.server.entity.SessionEntity;
import com.example.server.entity.UserEntity;
import com.example.server.exception.AppException;
import com.example.server.exception.ErrorCode;
import com.example.server.repository.AuditLogRepository;
import com.example.server.repository.SessionRepository;
import com.example.server.repository.UserRepository;
import com.example.server.security.SecurityUtil;
import com.example.server.service.AuthService;
import com.example.server.service.ExamAttemptService;
import com.example.server.service.QuestionService;
import com.example.server.service.RoomService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Điều phối toàn bộ các thông điệp từ C Gateway (16-byte TLV) tới các Spring Services tương ứng.
 */
@Service
public class GatewayMessageDispatcher {
    private static final Logger log = LoggerFactory.getLogger(GatewayMessageDispatcher.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private RoomService roomService;

    @Autowired
    private ExamAttemptService examAttemptService;

    @Autowired
    private QuestionService questionService;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private final ExecutorService executor = Executors.newFixedThreadPool(16);

    /**
     * Lưu ánh xạ phiên đăng nhập theo socket descriptor (clientId -> username).
     */
    private final Map<Long, String> clientSessions = new ConcurrentHashMap<>();

    @PreDestroy
    public void shutdown() {
        executor.shutdownNow();
    }

    public void dispatch(EngineHeader header, String payloadJson, GatewayWorkerClient client) {
        executor.submit(() -> {
            try {
                handleMessage(header, payloadJson, client);
            } catch (Exception e) {
                log.error("[GATEWAY-DISPATCHER] Error handling msgType 0x{}: {}",
                        String.format("%02X", header.getMsgType()), e.getMessage());
                sendErrorResponse(header, client, e.getMessage());
            } finally {
                SecurityUtil.clear();
            }
        });
    }

    public void handleMessage(EngineHeader header, String payloadJson, GatewayWorkerClient client) throws Exception {
        byte msgType = header.getMsgType();
        long clientId = header.getClientId();
        long seqId = header.getSeqId();

        String normalizedJson = (payloadJson == null || payloadJson.isBlank()) ? "{}" : payloadJson;
        JsonNode root = objectMapper.readTree(normalizedJson);

        bindSecurityContext(clientId, root);

        switch (msgType) {
            case EngineProtocolConstants.OP_PING: {
                client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_PONG, "{\"status\":\"OK\"}");
                break;
            }

            case EngineProtocolConstants.OP_AUTH_LOGIN_REQ: {
                if ("me".equalsIgnoreCase(root.path("action").asText())) {
                    UserProfileResponse profile = resolveCurrentUserProfile(clientId, root);
                    String respJson = objectMapper.writeValueAsString(profile);
                    client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_AUTH_LOGIN_RESP, respJson);
                } else {
                    LoginRequest req = objectMapper.treeToValue(root, LoginRequest.class);
                    AuthResponse resp = authService.login(req);
                    if (resp != null && resp.username() != null) {
                        clientSessions.put(clientId, resp.username());
                    }
                    String respJson = objectMapper.writeValueAsString(resp);
                    client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_AUTH_LOGIN_RESP, respJson);
                }
                break;
            }

            case EngineProtocolConstants.OP_AUTH_REGISTER_REQ: {
                RegisterRequest req = objectMapper.treeToValue(root, RegisterRequest.class);
                UserProfileResponse resp = authService.register(req);
                if (resp != null && resp.username() != null) {
                    clientSessions.put(clientId, resp.username());
                }
                String respJson = objectMapper.writeValueAsString(resp);
                client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_AUTH_REGISTER_RESP, respJson);
                break;
            }

            case EngineProtocolConstants.OP_ROOM_LIST_REQ: {
                String type = root.path("type").asText("");
                Object responseData;

                if ("questions".equalsIgnoreCase(type)) {
                    responseData = questionService.findAll();
                } else if (root.hasNonNull("topic")) {
                    responseData = questionService.findByTopic(root.get("topic").asText());
                } else if (root.hasNonNull("questionId")) {
                    responseData = questionService.findById(root.get("questionId").asLong());
                } else if ("audit-logs".equalsIgnoreCase(type)) {
                    List<AuditLogEntity> entities = auditLogRepository.findAll(Sort.by(Sort.Direction.DESC, "occurredAt"));
                    responseData = entities.stream().map(e -> new AuditLogResponse(
                            e.getId(),
                            e.getActor() != null ? e.getActor().getId() : null,
                            e.getActor() != null ? e.getActor().getDisplayName() : "Hệ thống",
                            e.getAction(),
                            e.getEntityType(),
                            e.getEntityId(),
                            e.getIpAddress(),
                            e.getMetadata(),
                            e.getOccurredAt()
                    )).toList();
                } else if (root.hasNonNull("id")) {
                    responseData = roomService.findById(root.get("id").asLong());
                } else if (root.hasNonNull("roomCode") && root.path("detail").asBoolean(false)) {
                    responseData = roomService.getRoomDetail(root.get("roomCode").asText());
                } else if (root.hasNonNull("roomCode")) {
                    RoomDetailResponse detail = roomService.getRoomDetail(root.get("roomCode").asText());
                    responseData = detail;
                } else {
                    responseData = roomService.findAll();
                }

                String respJson = objectMapper.writeValueAsString(responseData);
                client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_ROOM_LIST_RESP, respJson);
                break;
            }

            case EngineProtocolConstants.OP_ROOM_CREATE_REQ: {
                String action = root.path("action").asText("");

                if (root.hasNonNull("question")) {
                    CreateQuestionRequest qReq = objectMapper.treeToValue(root.get("question"), CreateQuestionRequest.class);
                    QuestionResponse createdQuestion = questionService.create(qReq);
                    client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_ROOM_CREATE_RESP,
                            objectMapper.writeValueAsString(createdQuestion));
                } else if (root.hasNonNull("questionId") && "delete".equalsIgnoreCase(action)) {
                    questionService.deleteById(root.get("questionId").asLong());
                    client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_ROOM_CREATE_RESP, "{\"deleted\":true}");
                } else if (root.hasNonNull("id") && "delete".equalsIgnoreCase(action)) {
                    roomService.deleteById(root.get("id").asLong());
                    client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_ROOM_CREATE_RESP, "{\"deleted\":true}");
                } else if (root.hasNonNull("id")) {
                    long roomId = root.get("id").asLong();
                    UpdateRoomRequest updateReq = objectMapper.treeToValue(root, UpdateRoomRequest.class);
                    RoomSummaryDto updated = roomService.update(roomId, updateReq);
                    client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_ROOM_CREATE_RESP,
                            objectMapper.writeValueAsString(updated));
                } else {
                    CreateRoomRequest req = objectMapper.treeToValue(root, CreateRoomRequest.class);
                    RoomSummaryDto created = roomService.create(req);
                    String respJson = objectMapper.writeValueAsString(created);
                    client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_ROOM_CREATE_RESP, respJson);

                    Map<String, Object> broadcastEvent = Map.of(
                            "eventType", "ROOM_CREATED",
                            "room", created
                    );
                    client.sendBroadcast(EngineProtocolConstants.OP_SERVER_BROADCAST,
                            objectMapper.writeValueAsString(broadcastEvent));
                }
                break;
            }

            case EngineProtocolConstants.OP_ROOM_JOIN_REQ: {
                String roomCode = root.path("roomCode").asText();
                String action = root.path("action").asText("");
                UserEntity currentUser = SecurityUtil.getCurrentUser().orElse(null);

                String username = root.path("username").asText("");
                if (username.isBlank() && currentUser != null) {
                    username = currentUser.getUsername();
                }

                String displayName = root.path("displayName").asText("");
                if (displayName.isBlank()) {
                    displayName = (currentUser != null && currentUser.getDisplayName() != null)
                            ? currentUser.getDisplayName()
                            : username;
                }

                if ("leave".equalsIgnoreCase(action)) {
                    roomService.leaveRoom(roomCode, username);
                    client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_ROOM_JOIN_RESP, "{\"left\":true}");
                } else {
                    RoomSummaryDto joined = roomService.joinRoom(roomCode, username, displayName);
                    String respJson = objectMapper.writeValueAsString(joined);
                    client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_ROOM_JOIN_RESP, respJson);

                    Map<String, Object> broadcastEvent = Map.of(
                            "eventType", "PARTICIPANT_JOINED",
                            "roomCode", roomCode,
                            "displayName", displayName
                    );
                    client.sendBroadcast(EngineProtocolConstants.OP_SERVER_BROADCAST,
                            objectMapper.writeValueAsString(broadcastEvent));
                }
                break;
            }

            case EngineProtocolConstants.OP_EXAM_START_REQ: {
                if (root.hasNonNull("mode")) {
                    StartAttemptRequest startReq = objectMapper.treeToValue(root, StartAttemptRequest.class);
                    AttemptResultResponse started = examAttemptService.startAttempt(startReq);
                    client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_EXAM_START_RESP,
                            objectMapper.writeValueAsString(started));
                } else if (root.hasNonNull("roomCode")) {
                    String roomCode = root.get("roomCode").asText();
                    roomService.startRoom(roomCode);
                    client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_EXAM_START_RESP,
                            "{\"status\":\"EXAM_STARTED\",\"roomCode\":\"" + roomCode + "\"}");

                    Map<String, Object> event = Map.of(
                            "eventType", "EXAM_STARTED",
                            "roomCode", roomCode
                    );
                    client.sendBroadcast(EngineProtocolConstants.OP_SERVER_BROADCAST,
                            objectMapper.writeValueAsString(event));
                } else {
                    StartAttemptRequest startReq = objectMapper.treeToValue(root, StartAttemptRequest.class);
                    AttemptResultResponse started = examAttemptService.startAttempt(startReq);
                    client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_EXAM_START_RESP,
                            objectMapper.writeValueAsString(started));
                }
                break;
            }

            case EngineProtocolConstants.OP_EXAM_SUBMIT_REQ: {
                String action = root.path("action").asText("");
                if (root.hasNonNull("attemptId") && root.hasNonNull("questionId")) {
                    long attemptId = root.get("attemptId").asLong();
                    long questionId = root.get("questionId").asLong();
                    Long selectedOptionId = (root.hasNonNull("selectedOptionId"))
                            ? root.get("selectedOptionId").asLong()
                            : null;
                    examAttemptService.submitAnswer(attemptId, questionId, selectedOptionId);
                    client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_EXAM_SUBMIT_RESP, "{\"saved\":true}");
                } else if (root.hasNonNull("attemptId") && "result".equalsIgnoreCase(action)) {
                    long attemptId = root.get("attemptId").asLong();
                    AttemptResultResponse result = examAttemptService.getResult(attemptId);
                    client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_EXAM_SUBMIT_RESP,
                            objectMapper.writeValueAsString(result));
                } else if (root.hasNonNull("attemptId")) {
                    long attemptId = root.get("attemptId").asLong();
                    AttemptResultResponse result = examAttemptService.submitExam(attemptId);
                    client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_EXAM_SUBMIT_RESP,
                            objectMapper.writeValueAsString(result));
                } else if (root.hasNonNull("roomCode")) {
                    String roomCode = root.get("roomCode").asText();
                    Map<String, Integer> finishData = roomService.finishRoom(roomCode);
                    client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_EXAM_SUBMIT_RESP,
                            objectMapper.writeValueAsString(finishData));

                    Map<String, Object> event = Map.of(
                            "eventType", "EXAM_ENDED",
                            "roomCode", roomCode
                    );
                    client.sendBroadcast(EngineProtocolConstants.OP_SERVER_BROADCAST,
                            objectMapper.writeValueAsString(event));
                } else {
                    throw new AppException(ErrorCode.VALIDATION_FAILED, "Thiếu attemptId hoặc roomCode khi nộp bài");
                }
                break;
            }

            default:
                log.warn("[GATEWAY-DISPATCHER] Unknown msgType: 0x{}", String.format("%02X", msgType));
                sendErrorResponse(header, client, "Unknown msgType: " + msgType);
                break;
        }
    }

    private void bindSecurityContext(long clientId, JsonNode root) {
        if (SecurityUtil.getCurrentUser().isPresent()) {
            return;
        }

        // 1. Ưu tiên đọc token nếu payload có gửi kèm
        if (root.hasNonNull("token") && !root.get("token").asText().isBlank()) {
            findUserByRawToken(root.get("token").asText().trim()).ifPresent(user -> {
                clientSessions.put(clientId, user.getUsername());
                SecurityUtil.setCurrentUser(user);
            });
            if (SecurityUtil.getCurrentUser().isPresent()) {
                return;
            }
        }

        // 2. Tra cứu theo username từ payload hoặc phiên đã lưu của clientId
        String username = root.path("username").asText("");
        if (username.isBlank()) {
            username = clientSessions.getOrDefault(clientId, "");
        }
        if (!username.isBlank() && userRepository != null) {
            userRepository.findByUsername(username).ifPresent(SecurityUtil::setCurrentUser);
            if (SecurityUtil.getCurrentUser().isPresent()) {
                return;
            }
        }

        // 3. Fallback user đầu tiên trong DB cho môi trường test / ẩn danh
        if (userRepository != null) {
            userRepository.findAll().stream().findFirst().ifPresent(SecurityUtil::setCurrentUser);
        }
    }

    private UserProfileResponse resolveCurrentUserProfile(long clientId, JsonNode root) {
        if (root.hasNonNull("token") && !root.get("token").asText().isBlank()) {
            return authService.getMe(root.get("token").asText().trim());
        }
        UserEntity user = SecurityUtil.getCurrentUser()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED, "Phiên đăng nhập không tồn tại"));
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                user.getSystemRole().name(),
                user.getStatus().name(),
                user.getCreatedAt()
        );
    }

    private Optional<UserEntity> findUserByRawToken(String rawToken) {
        if (sessionRepository == null || rawToken.isBlank()) {
            return Optional.empty();
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] tokenHash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return sessionRepository.findByTokenHashAndRevokedAtIsNull(tokenHash)
                    .filter(s -> s.getExpiresAt().isAfter(OffsetDateTime.now(ZoneOffset.UTC)))
                    .map(SessionEntity::getUser);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private void sendErrorResponse(EngineHeader header, GatewayWorkerClient client, String errorMsg) {
        try {
            Map<String, Object> err = new HashMap<>();
            err.put("error", true);
            err.put("message", errorMsg != null ? errorMsg : "Internal server error");
            String errJson = objectMapper.writeValueAsString(err);
            client.sendResponse(header.getClientId(), header.getSeqId(), (byte) (header.getMsgType() | 0x01), errJson);
        } catch (Exception e) {
            log.error("[GATEWAY-DISPATCHER] Failed to serialize error response: {}", e.getMessage());
        }
    }
}
