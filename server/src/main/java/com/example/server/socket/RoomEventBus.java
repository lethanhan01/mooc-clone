package com.example.server.socket;

import com.example.server.dto.room.RoomSummaryDto;
import com.example.server.exception.AppException;
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

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.SocketChannel;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Trạm điều phối sự kiện cho kênh TCP NIO (Port 9090 - Binary Framed Protocol).
 * Lưu ý: Giao diện Web (React 19 Client) đã chuyển sang kiến trúc 100% Stateless REST
 * kết hợp HTTP Short Polling + Server Authoritative Timestamp.
 */
@Component
public class RoomEventBus {

    private static final Logger log = LoggerFactory.getLogger(RoomEventBus.class);
    private static final String KEY_ROOM_ID = "roomId";

    private final RoomService roomService;
    private final ObjectMapper objectMapper;

    // roomId -> Set of TCP SocketChannels
    private final Map<String, Set<SocketChannel>> roomTcpChannels = new ConcurrentHashMap<>();
    // Lock riêng theo từng SocketChannel để đồng bộ luồng ghi mà không nghẽn chéo giữa các client
    private final Map<SocketChannel, ReentrantLock> channelWriteLocks = new ConcurrentHashMap<>();

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
                    handleJoinRoom(session, node);
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
                    String roomId = node.path(KEY_ROOM_ID).asText(session.getCurrentRoomId());
                    String questionId = node.path("questionId").asText();
                    String selectedOption = node.path("selectedOption").asText();
                    log.debug("User {} submitted answer in room {}: q={}, opt={}",
                            session.getUserId(), roomId, questionId, selectedOption);
                }
                case ProtocolConstants.OP_SUBMIT_EXAM -> {
                    JsonNode node = objectMapper.readTree(jsonPayload);
                    String roomId = node.path(KEY_ROOM_ID).asText(session.getCurrentRoomId());
                    Map<String, Integer> scores = roomService.finishRoom(roomId);
                    broadcastExamFinished(roomId, scores);
                }
                default -> log.warn("Unknown Opcode received: 0x{}", String.format("%04X", opcode));
            }
        } catch (Exception e) {
            log.error("Error handling TCP frame", e);
        }
    }

    private void handleJoinRoom(ClientSession session, JsonNode node) throws IOException {
        String roomId = node.path(KEY_ROOM_ID).asText("ROOM_DEFAULT");
        String userId = node.path("userId").asText("user_" + session.getSessionId().substring(0, 5));
        String userName = node.path("userName").asText("Thí sinh " + userId);

        try {
            roomService.joinRoom(roomId, userId, userName);
            session.setCurrentRoomId(roomId);
            session.setUserId(userId);
            session.setUserName(userName);
            registerTcpChannelToRoom(roomId, session.getChannel());
            broadcastRoomUpdated(roomId);
        } catch (AppException ae) {
            log.warn("[TCP JoinRoom Rejected] Session {}: {}", session.getSessionId(), ae.getMessage());
            String errPayload = objectMapper.writeValueAsString(Map.of(
                    "error", ae.getErrorCode().name(),
                    "message", ae.getMessage()
            ));
            ByteBuffer errFrame = PacketFramingEncoder.encode(ProtocolConstants.OP_ERROR, errPayload);
            sendToTcpChannel(session.getChannel(), errFrame);
        }
    }

    public void handleTcpDisconnect(ClientSession session) {
        String roomId = session.getCurrentRoomId();
        if (roomId != null) {
            unregisterTcpChannelFromRoom(roomId, session.getChannel());
            roomService.leaveRoom(roomId, session.getUserId());
            broadcastRoomUpdated(roomId);
        } else if (session.getChannel() != null) {
            channelWriteLocks.remove(session.getChannel());
        }
    }

    // ==============================================================
    // BROADCAST TỚI KÊNH TCP NIO
    // ==============================================================

    public void broadcastTimeTick(String roomId, int secondsRemaining) {
        String payload = "{\"secondsRemaining\":" + secondsRemaining + "}";
        ByteBuffer buffer = PacketFramingEncoder.encode(ProtocolConstants.OP_TIME_TICK, payload);
        broadcastToTcp(roomId, buffer);
    }

    public void broadcastRoomUpdated(String roomId) {
        RoomSummaryDto room = roomService.getRoomSummary(roomId).orElse(null);
        if (room == null) return;

        Map<String, Object> roomData = Map.of(
                KEY_ROOM_ID, room.roomCode(),
                "roomName", room.roomName(),
                "status", room.status(),
                "durationSeconds", room.durationSeconds(),
                "totalQuestions", room.totalQuestions(),
                "participantsCount", room.participantsCount()
        );

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

        try {
            String json = objectMapper.writeValueAsString(Map.of("scores", scores, "total", totalQuestions));
            ByteBuffer buffer = PacketFramingEncoder.encode(ProtocolConstants.OP_EXAM_FINISHED, json);
            broadcastToTcp(roomId, buffer);
        } catch (Exception e) {
            log.error("Failed to broadcast exam finished", e);
        }
    }

    // ==============================================================
    // QUẢN LÝ KÊNH TCP SOCKET
    // ==============================================================

    private void registerTcpChannelToRoom(String roomId, SocketChannel channel) {
        roomTcpChannels.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(channel);
    }

    private void unregisterTcpChannelFromRoom(String roomId, SocketChannel channel) {
        Set<SocketChannel> channels = roomTcpChannels.get(roomId);
        if (channels != null) {
            channels.remove(channel);
        }
        if (channel != null) {
            channelWriteLocks.remove(channel);
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
            ReentrantLock writeLock = channelWriteLocks.computeIfAbsent(channel, k -> new ReentrantLock());
            writeLock.lock();
            try {
                while (buffer.hasRemaining()) {
                    channel.write(buffer);
                }
            } catch (IOException e) {
                log.warn("Failed to write to TCP channel, closing: {}", e.getMessage());
                closeChannelQuietly(channel);
            } finally {
                writeLock.unlock();
            }
        }
    }

    private void closeChannelQuietly(SocketChannel channel) {
        channelWriteLocks.remove(channel);
        try {
            channel.close();
        } catch (IOException closeEx) {
            log.debug("Ignored error while closing TCP channel: {}", closeEx.getMessage());
        }
    }
}
