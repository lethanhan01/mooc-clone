package com.example.server.socket.gateway;

import com.example.server.socket.RoomEventBus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * Endpoint xử lý kết nối WebSocket từ trình duyệt Web (React 19 Client).
 */
@Component
public class ExamWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(ExamWebSocketHandler.class);
    private final RoomEventBus roomEventBus;

    public ExamWebSocketHandler(RoomEventBus roomEventBus) {
        this.roomEventBus = roomEventBus;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("[WebSocket] New client connected: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String payload = message.getPayload();
        roomEventBus.handleWebSocketMessage(session, payload);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        log.info("[WebSocket] Client disconnected: {}, status: {}", session.getId(), status);
        roomEventBus.handleWebSocketDisconnect(session);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.warn("[WebSocket] Transport error on session {}: {}", session.getId(), exception.getMessage());
    }
}
