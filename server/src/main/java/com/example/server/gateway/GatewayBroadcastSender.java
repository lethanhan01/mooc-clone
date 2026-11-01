package com.example.server.gateway;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Tiện ích hỗ trợ phát Broadcast thời gian thực từ Spring Services tới các Electron Desktop Clients.
 */
@Component
public class GatewayBroadcastSender {
    private static final Logger log = LoggerFactory.getLogger(GatewayBroadcastSender.class);

    @Autowired
    private GatewayWorkerClient workerClient;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Phát sự kiện phòng thi tới toàn bộ thí sinh đang kết nối.
     */
    public void broadcastRoomEvent(String eventType, Object data) {
        try {
            Map<String, Object> payload = Map.of(
                    "eventType", eventType,
                    "data", data,
                    "timestamp", System.currentTimeMillis()
            );
            String json = objectMapper.writeValueAsString(payload);
            workerClient.sendBroadcast(EngineProtocolConstants.OP_SERVER_BROADCAST, json);
        } catch (Exception e) {
            log.error("[GATEWAY-BROADCAST] Failed to broadcast event {}: {}", eventType, e.getMessage());
        }
    }
}

