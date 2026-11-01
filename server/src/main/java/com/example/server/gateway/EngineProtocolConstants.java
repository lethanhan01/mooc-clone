package com.example.server.gateway;

/**
 * Các hằng số đặc tả giao thức C Communication Engine (16-byte TLV Framing).
 */
public final class EngineProtocolConstants {
    private EngineProtocolConstants() {}

    public static final short MAGIC = 0x4D43; // 'MC'
    public static final byte VERSION = 0x01;
    public static final int HEADER_SIZE = 16;
    public static final long BROADCAST_CLIENT_ID = 0xFFFFFFFFL;
    public static final int MAX_PAYLOAD_SIZE = 2 * 1024 * 1024; // 2MB

    // Opcodes
    public static final byte OP_SYS_HANDSHAKE      = 0x00;
    public static final byte OP_AUTH_LOGIN_REQ     = 0x01;
    public static final byte OP_AUTH_LOGIN_RESP    = 0x02;
    public static final byte OP_AUTH_REGISTER_REQ  = 0x03;
    public static final byte OP_AUTH_REGISTER_RESP = 0x04;
    public static final byte OP_ROOM_LIST_REQ      = 0x10;
    public static final byte OP_ROOM_LIST_RESP     = 0x11;
    public static final byte OP_ROOM_CREATE_REQ    = 0x12;
    public static final byte OP_ROOM_CREATE_RESP   = 0x13;
    public static final byte OP_ROOM_JOIN_REQ      = 0x14;
    public static final byte OP_ROOM_JOIN_RESP     = 0x15;
    public static final byte OP_EXAM_START_REQ     = 0x20;
    public static final byte OP_EXAM_START_RESP    = 0x21;
    public static final byte OP_EXAM_SUBMIT_REQ    = 0x22;
    public static final byte OP_EXAM_SUBMIT_RESP   = 0x23;
    public static final byte OP_SERVER_BROADCAST   = (byte) 0x80;
    public static final byte OP_PING               = (byte) 0xFE;
    public static final byte OP_PONG               = (byte) 0xFF;
}

