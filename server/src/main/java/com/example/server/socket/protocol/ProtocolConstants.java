package com.example.server.socket.protocol;

/**
 * Các hằng số giao thức truyền thông nhị phân trên Socket TCP NIO.
 * Cấu trúc Header 8 Bytes: Magic (2B) + Opcode (2B) + Length (4B).
 */
public final class ProtocolConstants {
    private ProtocolConstants() {}

    /** Magic number nhận diện gói tin: 0x4D43 (ASCII: 'MC') */
    public static final short MAGIC = 0x4D43;

    /** Kích thước Header cố định (8 bytes) */
    public static final int HEADER_SIZE = 8;

    /** Dung lượng payload tối đa cho phép: 10MB */
    public static final int MAX_PAYLOAD_SIZE = 10 * 1024 * 1024;

    // --- Danh mục Opcodes ---
    public static final short OP_PING = 0x0001;
    public static final short OP_PONG = 0x0002;

    public static final short OP_JOIN_ROOM = 0x0010;
    public static final short OP_LEAVE_ROOM = 0x0011;

    public static final short OP_SUBMIT_ANSWER = 0x0020;
    public static final short OP_SUBMIT_EXAM = 0x0021;

    public static final short OP_TIME_TICK = 0x0030;
    public static final short OP_ROOM_UPDATED = 0x0031;
    public static final short OP_EXAM_FINISHED = 0x0032;

    public static final short OP_ERROR = 0x00FF;
}
