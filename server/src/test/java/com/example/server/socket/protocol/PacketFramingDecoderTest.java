package com.example.server.socket.protocol;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("Kiểm thử Bộ giải mã khung gói tin (Packet Framing Decoder)")
class PacketFramingDecoderTest {

    private PacketFramingDecoder decoder;
    private ByteBuffer buffer;

    @BeforeEach
    void setUp() {
        decoder = new PacketFramingDecoder();
        buffer = ByteBuffer.allocate(64 * 1024);
    }

    @Test
    @DisplayName("Test 1: Giải mã 1 khung gói tin chuẩn hoàn chỉnh")
    void testSingleCompleteFrame() {
        String json = "{\"roomId\":\"ROOM_101\",\"userId\":\"user_01\"}";
        ByteBuffer encoded = PacketFramingEncoder.encode(ProtocolConstants.OP_JOIN_ROOM, json);

        buffer.put(encoded);
        buffer.flip();

        List<PacketFrame> frames = decoder.decode(buffer);

        assertThat(frames).hasSize(1);
        PacketFrame frame = frames.get(0);
        assertThat(frame.getOpcode()).isEqualTo(ProtocolConstants.OP_JOIN_ROOM);
        assertThat(frame.getPayloadAsString()).isEqualTo(json);

        // Buffer sau khi compact() phải ở trạng thái position = 0 (hết sạch dữ liệu dở dang)
        assertThat(buffer.position()).isEqualTo(0);
    }

    @Test
    @DisplayName("Test 2: Xử lý dính gói (Sticky Packets - 3 frames liên tiếp trong 1 buffer)")
    void testStickyPackets() {
        ByteBuffer frame1 = PacketFramingEncoder.encode(ProtocolConstants.OP_PING, "ping1");
        ByteBuffer frame2 = PacketFramingEncoder.encode(ProtocolConstants.OP_SUBMIT_ANSWER, "answer2");
        ByteBuffer frame3 = PacketFramingEncoder.encode(ProtocolConstants.OP_SUBMIT_EXAM, "submit3");

        buffer.put(frame1);
        buffer.put(frame2);
        buffer.put(frame3);
        buffer.flip();

        List<PacketFrame> frames = decoder.decode(buffer);

        assertThat(frames).hasSize(3);
        assertThat(frames.get(0).getOpcode()).isEqualTo(ProtocolConstants.OP_PING);
        assertThat(frames.get(0).getPayloadAsString()).isEqualTo("ping1");

        assertThat(frames.get(1).getOpcode()).isEqualTo(ProtocolConstants.OP_SUBMIT_ANSWER);
        assertThat(frames.get(1).getPayloadAsString()).isEqualTo("answer2");

        assertThat(frames.get(2).getOpcode()).isEqualTo(ProtocolConstants.OP_SUBMIT_EXAM);
        assertThat(frames.get(2).getPayloadAsString()).isEqualTo("submit3");

        assertThat(buffer.position()).isEqualTo(0);
    }

    @Test
    @DisplayName("Test 3: Xử lý phân mảnh Header (Header bị chia cắt qua nhiều lần đọc)")
    void testFragmentedHeader() {
        String json = "{\"data\":\"test\"}";
        ByteBuffer encoded = PacketFramingEncoder.encode(ProtocolConstants.OP_TIME_TICK, json);
        byte[] allBytes = new byte[encoded.remaining()];
        encoded.get(allBytes);

        // Lần 1: Chỉ nhận 4 bytes đầu (chưa đủ 8 bytes header)
        buffer.put(allBytes, 0, 4);
        buffer.flip();
        List<PacketFrame> frames1 = decoder.decode(buffer);
        assertThat(frames1).isEmpty();
        // Buffer sau khi compact() phải giữ lại đúng 4 bytes
        assertThat(buffer.position()).isEqualTo(4);

        // Lần 2: Nhận tiếp số byte còn lại
        buffer.put(allBytes, 4, allBytes.length - 4);
        buffer.flip();
        List<PacketFrame> frames2 = decoder.decode(buffer);

        assertThat(frames2).hasSize(1);
        assertThat(frames2.get(0).getOpcode()).isEqualTo(ProtocolConstants.OP_TIME_TICK);
        assertThat(frames2.get(0).getPayloadAsString()).isEqualTo(json);
        assertThat(buffer.position()).isEqualTo(0);
    }

    @Test
    @DisplayName("Test 4: Xử lý phân mảnh Payload (Header đủ nhưng Payload đến từng phần)")
    void testFragmentedPayload() {
        String longPayload = "A".repeat(1000);
        ByteBuffer encoded = PacketFramingEncoder.encode(ProtocolConstants.OP_ROOM_UPDATED, longPayload);
        byte[] allBytes = new byte[encoded.remaining()];
        encoded.get(allBytes);

        // Header là 8 bytes, payload 1000 bytes.
        // Lần 1: Gửi 8 byte header + 300 byte payload = 308 bytes
        buffer.put(allBytes, 0, 308);
        buffer.flip();
        List<PacketFrame> frames1 = decoder.decode(buffer);
        assertThat(frames1).isEmpty();
        // Buffer giữ nguyên toàn bộ 308 bytes dở dang sau khi compact()
        assertThat(buffer.position()).isEqualTo(308);

        // Lần 2: Gửi nốt 700 bytes còn lại
        buffer.put(allBytes, 308, 700);
        buffer.flip();
        List<PacketFrame> frames2 = decoder.decode(buffer);

        assertThat(frames2).hasSize(1);
        assertThat(frames2.get(0).getOpcode()).isEqualTo(ProtocolConstants.OP_ROOM_UPDATED);
        assertThat(frames2.get(0).getPayloadAsString()).isEqualTo(longPayload);
        assertThat(buffer.position()).isEqualTo(0);
    }

    @Test
    @DisplayName("Test 5: Bắt lỗi khi gặp Magic Number sai quy định")
    void testInvalidMagic() {
        ByteBuffer badFrame = ByteBuffer.allocate(12);
        badFrame.putShort((short) 0x1234); // Sai Magic (đúng phải là 0x4D43)
        badFrame.putShort(ProtocolConstants.OP_PING);
        badFrame.putInt(4);
        badFrame.put("test".getBytes(StandardCharsets.UTF_8));
        badFrame.flip();

        buffer.put(badFrame);
        buffer.flip();

        assertThatThrownBy(() -> decoder.decode(buffer))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid protocol magic");
    }
}
