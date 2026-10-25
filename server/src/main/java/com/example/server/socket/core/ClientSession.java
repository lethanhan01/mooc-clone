package com.example.server.socket.core;

import java.nio.ByteBuffer;
import java.nio.channels.SocketChannel;

/**
 * Quản lý phiên làm việc của 1 kết nối TCP SocketChannel.
 * Chứa đệm tích lũy (accumulation buffer) per-connection và thông tin phòng thi.
 */
public class ClientSession {
    private final SocketChannel channel;
    private final String sessionId;
    private final ByteBuffer accumulationBuffer;

    private volatile String currentRoomId;
    private volatile String userId;
    private volatile String userName;

    public ClientSession(SocketChannel channel, String sessionId) {
        this.channel = channel;
        this.sessionId = sessionId;
        // Cấp phát bộ đệm tích lũy 64KB cho từng kết nối
        this.accumulationBuffer = ByteBuffer.allocate(64 * 1024);
    }

    public SocketChannel getChannel() {
        return channel;
    }

    public String getSessionId() {
        return sessionId;
    }

    public ByteBuffer getAccumulationBuffer() {
        return accumulationBuffer;
    }

    public String getCurrentRoomId() {
        return currentRoomId;
    }

    public void setCurrentRoomId(String currentRoomId) {
        this.currentRoomId = currentRoomId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }
}
