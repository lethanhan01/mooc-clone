package com.example.server.gateway;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.DataInputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

/**
 * TCP Worker Client kết nối bền vững tới C Communication Engine (C Gateway).
 * Đăng ký định danh role: WORKER để nhận luồng yêu cầu từ các Electron Client.
 */
@Component
public class GatewayWorkerClient {
    private static final Logger log = LoggerFactory.getLogger(GatewayWorkerClient.class);

    @Value("${mooc.gateway.host:127.0.0.1}")
    private String gatewayHost;

    @Value("${mooc.gateway.port:9000}")
    private int gatewayPort;

    @Value("${mooc.gateway.enabled:true}")
    private boolean enabled;

    @Autowired
    private GatewayMessageDispatcher dispatcher;

    private Socket socket;
    private OutputStream outputStream;
    private DataInputStream inputStream;
    private volatile boolean running = false;
    private Thread workerThread;

    @PostConstruct
    public void start() {
        if (!enabled) {
            log.info("[GATEWAY-WORKER] C Gateway worker client is disabled via configuration.");
            return;
        }

        running = true;
        workerThread = new Thread(this::connectionLoop, "GatewayWorkerClientThread");
        workerThread.setDaemon(true);
        workerThread.start();
    }

    @PreDestroy
    public void stop() {
        running = false;
        closeSocket();
        if (workerThread != null) {
            workerThread.interrupt();
        }
        log.info("[GATEWAY-WORKER] Worker client stopped.");
    }

    private void connectionLoop() {
        while (running) {
            try {
                log.info("[GATEWAY-WORKER] Connecting to C Gateway at {}:{}...", gatewayHost, gatewayPort);
                socket = new Socket(gatewayHost, gatewayPort);
                outputStream = socket.getOutputStream();
                inputStream = new DataInputStream(socket.getInputStream());

                // Gửi Handshake frame định danh vai trò Worker
                sendHandshake();
                log.info("[GATEWAY-WORKER] Connected and registered as WORKER to C Gateway successfully.");

                // Vòng lặp đọc stream
                byte[] headerBytes = new byte[EngineProtocolConstants.HEADER_SIZE];
                while (running) {
                    inputStream.readFully(headerBytes);
                    EngineHeader header = EngineHeader.decode(headerBytes);

                    if (!header.isValid()) {
                        log.warn("[GATEWAY-WORKER] Received invalid magic or version: {}", header);
                        break;
                    }

                    int payloadLen = (int) header.getPayloadLen();
                    if (payloadLen > EngineProtocolConstants.MAX_PAYLOAD_SIZE) {
                        log.error("[GATEWAY-WORKER] Payload length exceeds maximum ({} bytes)", payloadLen);
                        break;
                    }

                    byte[] payloadBytes = new byte[payloadLen];
                    if (payloadLen > 0) {
                        inputStream.readFully(payloadBytes);
                    }
                    String payloadJson = new String(payloadBytes, StandardCharsets.UTF_8);

                    // Xử lý gói tin bất đồng bộ qua dispatcher
                    dispatcher.dispatch(header, payloadJson, this);
                }
            } catch (Exception e) {
                if (running) {
                    log.warn("[GATEWAY-WORKER] Connection lost or failed: {}. Retrying in 2 seconds...", e.getMessage());
                }
            } finally {
                closeSocket();
            }

            if (running) {
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }

    private void sendHandshake() throws Exception {
        String handshakeJson = "{\"role\":\"WORKER\"}";
        byte[] payloadBytes = handshakeJson.getBytes(StandardCharsets.UTF_8);
        EngineHeader header = new EngineHeader(
                EngineProtocolConstants.OP_SYS_HANDSHAKE,
                0,
                0,
                payloadBytes.length
        );

        synchronized (this) {
            if (outputStream != null) {
                outputStream.write(header.encode());
                outputStream.write(payloadBytes);
                outputStream.flush();
            }
        }
    }

    /**
     * Gửi khung tin phản hồi tới Client cụ thể (Unicast) qua C Gateway.
     */
    public synchronized void sendResponse(long clientId, long seqId, byte msgType, String payloadJson) {
        if (outputStream == null) {
            log.warn("[GATEWAY-WORKER] Cannot send response: outputStream is null");
            return;
        }

        try {
            byte[] payloadBytes = (payloadJson != null) ? payloadJson.getBytes(StandardCharsets.UTF_8) : new byte[0];
            EngineHeader header = new EngineHeader(msgType, seqId, clientId, payloadBytes.length);

            outputStream.write(header.encode());
            if (payloadBytes.length > 0) {
                outputStream.write(payloadBytes);
            }
            outputStream.flush();
        } catch (Exception e) {
            log.error("[GATEWAY-WORKER] Error sending response to client {}: {}", clientId, e.getMessage());
        }
    }

    /**
     * Phát broadcast khung tin tới toàn bộ Electron Clients qua C Gateway.
     */
    public synchronized void sendBroadcast(byte msgType, String payloadJson) {
        sendResponse(EngineProtocolConstants.BROADCAST_CLIENT_ID, 0, msgType, payloadJson);
    }

    private void closeSocket() {
        try {
            if (socket != null && !socket.isClosed()) {
                socket.close();
            }
        } catch (Exception ignored) {}
        socket = null;
        outputStream = null;
        inputStream = null;
    }
}

