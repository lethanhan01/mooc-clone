package com.example.server.socket.protocol;

import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.List;

/**
 * Bộ giải mã khung gói tin (Packet Framing Decoder).
 * Xử lý triệt để bài toán truyền dòng TCP:
 * 1. Chống phân mảnh gói tin (Packet Fragmentation): Giữ lại buffer nếu đọc thiếu header hoặc thiếu payload.
 * 2. Chống dính gói tin (Sticky Packets): Tách chuẩn xác nhiều gói tin liên tiếp trong một buffer đọc.
 */
public class PacketFramingDecoder {

    /**
     * Giải mã các khung gói tin từ buffer tích lũy.
     * Quy ước: accumulationBuffer được truyền vào sau khi đã gọi flip() (sẵn sàng đọc).
     * Trước khi trả về, hàm sẽ gọi compact() để sẵn sàng cho lần channel.read() tiếp theo.
     *
     * @param accumulationBuffer Bộ đệm tích lũy dữ liệu của kết nối
     * @return Danh sách các gói tin hoàn chỉnh được giải mã
     */
    public List<PacketFrame> decode(ByteBuffer accumulationBuffer) {
        List<PacketFrame> frames = new ArrayList<>();

        while (accumulationBuffer.remaining() >= ProtocolConstants.HEADER_SIZE) {
            // Đánh dấu vị trí bắt đầu Header để rewind nếu payload chưa về đủ
            accumulationBuffer.mark();

            short magic = accumulationBuffer.getShort();
            if (magic != ProtocolConstants.MAGIC) {
                throw new IllegalArgumentException(String.format("Invalid protocol magic: 0x%04X, expected 0x%04X", magic, ProtocolConstants.MAGIC));
            }

            short opcode = accumulationBuffer.getShort();
            int payloadLength = accumulationBuffer.getInt();

            if (payloadLength < 0 || payloadLength > ProtocolConstants.MAX_PAYLOAD_SIZE) {
                throw new IllegalArgumentException("Payload length exceeds allowed limit: " + payloadLength);
            }

            // Kiểm tra xem payload đã về đủ trong buffer chưa
            if (accumulationBuffer.remaining() < payloadLength) {
                // Chưa đủ dữ liệu payload -> Rewind con trỏ về trước Header và chờ lần đọc mạng tiếp theo
                accumulationBuffer.reset();
                break;
            }

            // Đã có đủ cả Header và Payload -> Trích xuất dữ liệu
            byte[] payloadBytes = new byte[payloadLength];
            if (payloadLength > 0) {
                accumulationBuffer.get(payloadBytes);
            }

            frames.add(new PacketFrame(opcode, payloadBytes));
        }

        // Dồn các byte dở dang còn lại về đầu buffer để chuẩn bị cho lần ghi tiếp theo
        accumulationBuffer.compact();

        return frames;
    }
}
