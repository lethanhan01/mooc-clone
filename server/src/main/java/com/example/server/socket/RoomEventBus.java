package com.example.server.socket;

import com.example.server.dto.room.RoomSummaryDto;
import com.example.server.service.RoomService;
import com.example.server.socket.core.ClientSession;
import com.example.server.socket.protocol.PacketFrame;
import com.example.server.socket.protocol.PacketFramingEncoder;
import com.example.server.socket.protocol.ProtocolConstants;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.SocketChannel;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Trạm điều phối sự kiện thời gian thực (Room Event Bus).
 * Hội tụ và broadcast sự kiện cho cả 2 kênh:
 * 1. Kênh TCP NIO (Port 9090 - Binary Framed Protocol)
 * 2. Kênh WebSocket (Port 8080 - JSON Text Protocol)
 * Kết nối với tầng dữ liệu phòng thi qua RoomService (JPA-backed).
 */
@Component
public class RoomEventBus {

    private static final Logger log = LoggerFactory.getLogger(RoomEventBus.class);

    private final RoomService roomService;
    private final ObjectMapper objectMapper;

    // roomId -> Set of TCP SocketChannels
    private final Map<String, Set<SocketChannel>> roomTcpChannels = new ConcurrentHashMap<>();

    // roomId -> Set of WebSocketSessions
    private final Map<String, Set<WebSocketSession>> roomWebSessions = new ConcurrentHashMap<>();

    // WebSocketSession -> userId
    private final Map<WebSocketSession, String> wsUserMap = new ConcurrentHashMap<>();
    // WebSocketSession -> roomId
    private final Map<WebSocketSession, String> wsRoomMap = new ConcurrentHashMap<>();

    public RoomEventBus(RoomService roomService, ObjectMapper objectMapper) {
        this.roomService = roomService;
        this.objectMapper = objectMapper;
    }

    // ==============================================================
    // XỬ LÝ SỰ KIỆN TỪ KÊNH TCP NIO
    // ==============================================================

    public void handleTcpFrame(ClientSession session, PacketFrame frame) {
        short opcode = frame.getOpcode();
        String jsonPayload = frame.getPayloadAsString();
        log.info("[TCP Inbound] Opcode: 0x{}, Session: {}, Payload: {}",
                String.format("%04X", opcode), session.getSessionId(), jsonPayload);

        try {
            switch (opcode) {
                case ProtocolConstants.OP_PING -> {
                    ByteBuffer pong = PacketFramingEncoder.encode(ProtocolConstants.OP_PONG, "{\"status\":\"ok\"}");
                    sendToTcpChannel(session.getChannel(), pong);
                }
                case ProtocolConstants.OP_JOIN_ROOM -> {
                    JsonNode node = objectMapper.readTree(jsonPayload);
                    String roomId = node.path("roomId").asText("ROOM_DEFAULT");
                    String userId = node.path("userId").asText("user_" + session.getSessionId().substring(0, 5));
                    String userName = node.path("userName").asText("Thí sinh " + userId);

                    session.setCurrentRoomId(roomId);
                    session.setUserId(userId);
                    session.setUserName(userName);

                    registerTcpChannelToRoom(roomId, session.getChannel());
                    roomService.joinRoom(roomId, userId, userName);
                    broadcastRoomUpdated(roomId);
                }
                case ProtocolConstants.OP_LEAVE_ROOM -> {
                    String roomId = session.getCurrentRoomId();
                    if (roomId != null) {
                        unregisterTcpChannelFromRoom(roomId, session.getChannel());
                        roomService.leaveRoom(roomId, session.getUserId());
                        broadcastRoomUpdated(roomId);
                    }
                }
                case ProtocolConstants.OP_SUBMIT_ANSWER -> {
                    JsonNode node = objectMapper.readTree(jsonPayload);
                    String roomId = node.path("roomId").asText(session.getCurrentRoomId());
                    String questionId = node.path("questionId").asText();
                    String selectedOption = node.path("selectedOption").asText();
                    log.debug("User {} submitted answer in room {}: q={}, opt={}",
                            session.getUserId(), roomId, questionId, selectedOption);
                }
                case ProtocolConstants.OP_SUBMIT_EXAM -> {
                    JsonNode node = objectMapper.readTree(jsonPayload);
                    String roomId = node.path("roomId").asText(session.getCurrentRoomId());
                    Map<String, Integer> scores = roomService.finishRoom(roomId);
                    broadcastExamFinished(roomId, scores);
                }
                default -> log.warn("Unknown Opcode received: 0x{}", String.format("%04X", opcode));
            }
        } catch (Exception e) {
            log.error("Error handling TCP frame", e);
        }
    }

    public void handleTcpDisconnect(ClientSession session) {
        String roomId = session.getCurrentRoomId();
        if (roomId != null) {
            unregisterTcpChannelFromRoom(roomId, session.getChannel());
            roomService.leaveRoom(roomId, session.getUserId());
            broadcastRoomUpdated(roomId);
        }
    }

    // ==============================================================
    // XỬ LÝ SỰ KIỆN TỪ KÊNH WEBSOCKET
    // ==============================================================

    public void handleWebSocketMessage(WebSocketSession wsSession, String text) {
        try {
            JsonNode root = objectMapper.readTree(text);
            String event = root.path("event").asText();
            JsonNode data = root.path("data");

            log.info("[WS Inbound] Event: {}, Session: {}", event, wsSession.getId());

            switch (event) {
                case "join_room" -> {
                    String roomId = data.path("roomId").asText("ROOM_DEFAULT");
                    JsonNode userNode = data.path("user");
                    String userId = userNode.path("id").asText("ws_user_" + wsSession.getId().substring(0, 5));
                    String userName = userNode.path("name").asText("Thí sinh " + userId);

                    wsUserMap.put(wsSession, userId);
                    wsRoomMap.put(wsSession, roomId);

                    registerWebSessionToRoom(roomId, wsSession);
                    roomService.joinRoom(roomId, userId, userName);
                    broadcastRoomUpdated(roomId);
                }
                case "leave_room" -> {
                    String roomId = data.path("roomId").asText(wsRoomMap.get(wsSession));
                    if (roomId != null) {
                        unregisterWebSessionFromRoom(roomId, wsSession);
                        String userId = wsUserMap.get(wsSession);
                        roomService.leaveRoom(roomId, userId);
                        broadcastRoomUpdated(roomId);
                    }
                }
                case "submit_answer" -> {
                    String roomId = data.path("roomId").asText(wsRoomMap.get(wsSession));
                    String questionId = data.path("questionId").asText();
                    String selectedOption = data.path("selectedOption").asText();
                    String userId = wsUserMap.get(wsSession);
                    log.debug("WS User {} submitted answer in room {}: q={}, opt={}",
                            userId, roomId, questionId, selectedOption);
                }
                case "submit_exam" -> {
                    String roomId = data.path("roomId").asText(wsRoomMap.get(wsSession));
                    Map<String, Integer> scores = roomService.finishRoom(roomId);
                    broadcastExamFinished(roomId, scores);
                }
                default -> log.warn("Unhandled WebSocket event: {}", event);
            }
        } catch (Exception e) {
            log.error("Error handling WebSocket message", e);
        }
    }

    public void handleWebSocketDisconnect(WebSocketSession wsSession) {
        String roomId = wsRoomMap.remove(wsSession);
        String userId = wsUserMap.remove(wsSession);
        if (roomId != null && userId != null) {
            unregisterWebSessionFromRoom(roomId, wsSession);
            roomService.leaveRoom(roomId, userId);
            broadcastRoomUpdated(roomId);
        }
    }

    // ==============================================================
    // BROADCAST ĐỒNG THỜI (DUAL BROADCAST TO TCP & WEBSOCKET)
    // ==============================================================

    public void broadcastTimeTick(String roomId, int secondsRemaining) {
        // 1. Gửi qua WebSocket
        broadcastToWebSocket(roomId, "time_tick", secondsRemaining);

        // 2. Gửi qua TCP NIO
        String payload = "{\"secondsRemaining\":" + secondsRemaining + "}";
        ByteBuffer buffer = PacketFramingEncoder.encode(ProtocolConstants.OP_TIME_TICK, payload);
        broadcastToTcp(roomId, buffer);
    }

    public void broadcastRoomUpdated(String roomId) {
        RoomSummaryDto room = roomService.getRoomSummary(roomId).orElse(null);
        if (room == null) return;

        Map<String, Object> roomData = Map.of(
                "roomId", room.roomCode(),
                "roomName", room.roomName(),
                "status", room.status(),
                "durationSeconds", room.durationSeconds(),
                "totalQuestions", room.totalQuestions(),
                "participantsCount", room.participantsCount()
        );

        // 1. WebSocket
        broadcastToWebSocket(roomId, "room_updated", roomData);

        // 2. TCP NIO
        try {
            String json = objectMapper.writeValueAsString(roomData);
            ByteBuffer buffer = PacketFramingEncoder.encode(ProtocolConstants.OP_ROOM_UPDATED, json);
            broadcastToTcp(roomId, buffer);
        } catch (Exception e) {
            log.error("Failed to serialize room data", e);
        }
    }

    public void broadcastExamFinished(String roomId, Map<String, Integer> scores) {
        RoomSummaryDto room = roomService.getRoomSummary(roomId).orElse(null);
        int totalQuestions = room != null ? room.totalQuestions() : 10;

        // WebSocket
        broadcastToWebSocket(roomId, "exam_finished", Map.of(
                "scores", scores,
                "totalQuestions", totalQuestions
        ));

        // TCP NIO
        try {
            String json = objectMapper.writeValueAsString(Map.of("scores", scores, "total", totalQuestions));
            ByteBuffer buffer = PacketFramingEncoder.encode(ProtocolConstants.OP_EXAM_FINISHED, json);
            broadcastToTcp(roomId, buffer);
        } catch (Exception e) {
            log.error("Failed to broadcast exam finished", e);
        }
    }

    // ==============================================================
    // QUẢN LÝ KÊNH & SOCKET
    // ==============================================================

    private void registerTcpChannelToRoom(String roomId, SocketChannel channel) {
        roomTcpChannels.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(channel);
    }

    private void unregisterTcpChannelFromRoom(String roomId, SocketChannel channel) {
        Set<SocketChannel> channels = roomTcpChannels.get(roomId);
        if (channels != null) {
            channels.remove(channel);
        }
    }

    private void registerWebSessionToRoom(String roomId, WebSocketSession session) {
        roomWebSessions.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(session);
    }

    private void unregisterWebSessionFromRoom(String roomId, WebSocketSession session) {
        Set<WebSocketSession> sessions = roomWebSessions.get(roomId);
        if (sessions != null) {
            sessions.remove(session);
        }
    }

    private void broadcastToWebSocket(String roomId, String event, Object data) {
        Set<WebSocketSession> sessions = roomWebSessions.getOrDefault(roomId, Collections.emptySet());
        if (sessions.isEmpty()) return;

        try {
            String jsonMessage = objectMapper.writeValueAsString(Map.of("event", event, "data", data));
            TextMessage textMessage = new TextMessage(jsonMessage);

            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    synchronized (session) {
                        session.sendMessage(textMessage);
                    }
                }
            }
        } catch (IOException e) {
            log.error("Failed to send WebSocket broadcast to room {}", roomId, e);
        }
    }

    private void broadcastToTcp(String roomId, ByteBuffer buffer) {
        Set<SocketChannel> channels = roomTcpChannels.getOrDefault(roomId, Collections.emptySet());
        if (channels.isEmpty()) return;

        for (SocketChannel channel : channels) {
            sendToTcpChannel(channel, buffer.slice());
        }
    }

    private void sendToTcpChannel(SocketChannel channel, ByteBuffer buffer) {
        if (channel != null && channel.isOpen()) {
            try {
                synchronized (channel) {
                    while (buffer.hasRemaining()) {
                        channel.write(buffer);
                    }
                }
            } catch (IOException e) {
                log.warn("Failed to write to TCP channel, closing: {}", e.getMessage());
                try {
                    channel.close();
                } catch (IOException ignored) {}
            }
        }
    }
}
