package com.example.server.socket.protocol;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

/**
 * Đối tượng gói tin hoàn chỉnh sau khi giải mã từ luồng nhị phân TCP.
 */
public class PacketFrame {
    private final short opcode;
    private final int length;
    private final byte[] payload;

    public PacketFrame(short opcode, byte[] payload) {
        this.opcode = opcode;
        this.payload = payload != null ? payload : new byte[0];
        this.length = this.payload.length;
    }

    public short getOpcode() {
        return opcode;
    }

    public int getLength() {
        return length;
    }

    public byte[] getPayload() {
        return payload;
    }

    public String getPayloadAsString() {
        return new String(payload, StandardCharsets.UTF_8);
    }

    @Override
    public String toString() {
        return "PacketFrame{" +
                "opcode=" + String.format("0x%04X", opcode) +
                ", length=" + length +
                ", payloadPreview='" + (length > 50 ? getPayloadAsString().substring(0, 50) + "..." : getPayloadAsString()) + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PacketFrame that)) return false;
        return opcode == that.opcode && length == that.length && Arrays.equals(payload, that.payload);
    }

    @Override
    public int hashCode() {
        int result = Short.hashCode(opcode);
        result = 31 * result + Integer.hashCode(length);
        result = 31 * result + Arrays.hashCode(payload);
        return result;
    }
}
