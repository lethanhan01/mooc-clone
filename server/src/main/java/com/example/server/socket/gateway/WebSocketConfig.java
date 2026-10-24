package com.example.server.socket.gateway;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * Cấu hình Spring WebSocket đăng ký endpoint /ws.
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final ExamWebSocketHandler examWebSocketHandler;

    public WebSocketConfig(ExamWebSocketHandler examWebSocketHandler) {
        this.examWebSocketHandler = examWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(examWebSocketHandler, "/ws")
                .setAllowedOrigins("*");
    }
}
