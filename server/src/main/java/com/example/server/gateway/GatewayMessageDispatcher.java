package com.example.server.gateway;

import com.example.server.dto.attempt.AttemptResultResponse;
import com.example.server.dto.attempt.StartAttemptRequest;
import com.example.server.dto.auth.AuthResponse;
import com.example.server.dto.auth.LoginRequest;
import com.example.server.dto.auth.RegisterRequest;
import com.example.server.dto.auth.UserProfileResponse;
import com.example.server.dto.room.CreateRoomRequest;
import com.example.server.dto.room.RoomSummaryDto;
import com.example.server.service.AuthService;
import com.example.server.service.ExamAttemptService;
import com.example.server.service.RoomService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Điều phối các thông điệp từ C Gateway tới các Spring Services tương ứng.
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
    private ObjectMapper objectMapper;

    private final ExecutorService executor = Executors.newFixedThreadPool(16);

    public void dispatch(EngineHeader header, String payloadJson, GatewayWorkerClient client) {
        executor.submit(() -> {
            try {
                handleMessage(header, payloadJson, client);
            } catch (Exception e) {
                log.error("[GATEWAY-DISPATCHER] Error handling msgType 0x{:02X}: {}", header.getMsgType(), e.getMessage());
                sendErrorResponse(header, client, e.getMessage());
            }
        });
    }

    private void handleMessage(EngineHeader header, String payloadJson, GatewayWorkerClient client) throws Exception {
        byte msgType = header.getMsgType();
        long clientId = header.getClientId();
        long seqId = header.getSeqId();

        switch (msgType) {
            case EngineProtocolConstants.OP_PING: {
                client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_PONG, "{\"status\":\"OK\"}");
                break;
            }

            case EngineProtocolConstants.OP_AUTH_LOGIN_REQ: {
                LoginRequest req = objectMapper.readValue(payloadJson, LoginRequest.class);
                AuthResponse resp = authService.login(req);
                String respJson = objectMapper.writeValueAsString(resp);
                client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_AUTH_LOGIN_RESP, respJson);
                break;
            }

            case EngineProtocolConstants.OP_AUTH_REGISTER_REQ: {
                RegisterRequest req = objectMapper.readValue(payloadJson, RegisterRequest.class);
                UserProfileResponse resp = authService.register(req);
                String respJson = objectMapper.writeValueAsString(resp);
                client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_AUTH_REGISTER_RESP, respJson);
                break;
            }

            case EngineProtocolConstants.OP_ROOM_LIST_REQ: {
                // Lấy danh sách tóm tắt phòng thi
                Object rooms = roomService.findAll();
                String respJson = objectMapper.writeValueAsString(rooms);
                client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_ROOM_LIST_RESP, respJson);
                break;
            }

            case EngineProtocolConstants.OP_ROOM_CREATE_REQ: {
                CreateRoomRequest req = objectMapper.readValue(payloadJson, CreateRoomRequest.class);
                RoomSummaryDto created = roomService.create(req);
                String respJson = objectMapper.writeValueAsString(created);
                client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_ROOM_CREATE_RESP, respJson);

                // Broadcast thông báo phòng thi mới được tạo
                Map<String, Object> broadcastEvent = Map.of(
                        "eventType", "ROOM_CREATED",
                        "room", created
                );
                client.sendBroadcast(EngineProtocolConstants.OP_SERVER_BROADCAST,
                        objectMapper.writeValueAsString(broadcastEvent));
                break;
            }

            case EngineProtocolConstants.OP_ROOM_JOIN_REQ: {
                JsonNode root = objectMapper.readTree(payloadJson);
                String roomCode = root.path("roomCode").asText();
                String username = root.path("username").asText();
                String displayName = root.path("displayName").asText();

                RoomSummaryDto joined = roomService.joinRoom(roomCode, username, displayName);
                String respJson = objectMapper.writeValueAsString(joined);
                client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_ROOM_JOIN_RESP, respJson);

                // Broadcast người mới vào phòng
                Map<String, Object> broadcastEvent = Map.of(
                        "eventType", "PARTICIPANT_JOINED",
                        "roomCode", roomCode,
                        "displayName", displayName
                );
                client.sendBroadcast(EngineProtocolConstants.OP_SERVER_BROADCAST,
                        objectMapper.writeValueAsString(broadcastEvent));
                break;
            }

            case EngineProtocolConstants.OP_EXAM_START_REQ: {
                JsonNode root = objectMapper.readTree(payloadJson);
                if (root.has("roomCode")) {
                    String roomCode = root.get("roomCode").asText();
                    roomService.startRoom(roomCode);
                    client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_EXAM_START_RESP,
                            "{\"status\":\"EXAM_STARTED\",\"roomCode\":\"" + roomCode + "\"}");

                    // Broadcast cho cả phòng thi bắt đầu
                    Map<String, Object> event = Map.of(
                            "eventType", "EXAM_STARTED",
                            "roomCode", roomCode
                    );
                    client.sendBroadcast(EngineProtocolConstants.OP_SERVER_BROADCAST,
                            objectMapper.writeValueAsString(event));
                } else {
                    StartAttemptRequest startReq = objectMapper.readValue(payloadJson, StartAttemptRequest.class);
                    AttemptResultResponse started = examAttemptService.startAttempt(startReq);
                    client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_EXAM_START_RESP,
                            objectMapper.writeValueAsString(started));
                }
                break;
            }

            case EngineProtocolConstants.OP_EXAM_SUBMIT_REQ: {
                JsonNode root = objectMapper.readTree(payloadJson);
                Long attemptId = root.path("attemptId").asLong();
                AttemptResultResponse result = examAttemptService.submitExam(attemptId);
                client.sendResponse(clientId, seqId, EngineProtocolConstants.OP_EXAM_SUBMIT_RESP,
                        objectMapper.writeValueAsString(result));
                break;
            }

            default:
                log.warn("[GATEWAY-DISPATCHER] Unknown msgType: 0x{:02X}", msgType);
                sendErrorResponse(header, client, "Unknown msgType: " + msgType);
                break;
        }
    }

    private void sendErrorResponse(EngineHeader header, GatewayWorkerClient client, String errorMsg) {
        try {
            Map<String, Object> err = new HashMap<>();
            err.put("error", true);
            err.put("message", errorMsg);
            String errJson = objectMapper.writeValueAsString(err);
            client.sendResponse(header.getClientId(), header.getSeqId(), (byte) (header.getMsgType() | 0x01), errJson);
        } catch (Exception e) {
            log.error("[GATEWAY-DISPATCHER] Failed to serialize error response: {}", e.getMessage());
        }
    }
}
