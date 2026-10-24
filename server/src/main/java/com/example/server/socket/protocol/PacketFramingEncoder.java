package com.example.server.socket.protocol;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;

/**
 * Bộ mã hóa khung gói tin (Packet Framing Encoder).
 * Đóng gói Header 8-byte và Payload thành ByteBuffer sẵn sàng ghi ra SocketChannel.
 */
public class PacketFramingEncoder {

    /**
     * Mã hóa dữ liệu thành ByteBuffer hoàn chỉnh (đã gọi flip(), sẵn sàng write ra channel).
     *
     * @param opcode  Mã lệnh của gói tin
     * @param payload Mảng byte dữ liệu
     * @return ByteBuffer chứa khung gói tin hoàn chỉnh
     */
    public static ByteBuffer encode(short opcode, byte[] payload) {
        int payloadLength = payload != null ? payload.length : 0;
        int totalLength = ProtocolConstants.HEADER_SIZE + payloadLength;

        ByteBuffer buffer = ByteBuffer.allocate(totalLength);
        buffer.putShort(ProtocolConstants.MAGIC);
        buffer.putShort(opcode);
        buffer.putInt(payloadLength);
        if (payloadLength > 0) {
            buffer.put(payload);
        }
        buffer.flip();
        return buffer;
    }

    /**
     * Tiện ích mã hóa chuỗi JSON UTF-8.
     *
     * @param opcode      Mã lệnh của gói tin
     * @param jsonPayload Chuỗi JSON nội dung
     * @return ByteBuffer chứa khung gói tin hoàn chỉnh
     */
    public static ByteBuffer encode(short opcode, String jsonPayload) {
        byte[] payloadBytes = jsonPayload != null ? jsonPayload.getBytes(StandardCharsets.UTF_8) : new byte[0];
        return encode(opcode, payloadBytes);
    }
}
