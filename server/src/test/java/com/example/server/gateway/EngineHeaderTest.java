package com.example.server.gateway;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EngineHeaderTest {

    @Test
    @DisplayName("Kiểm thử đóng gói và giải mã Header 16 bytes đồng bộ với C Gateway")
    void testEncodeDecode() {
        EngineHeader header = new EngineHeader(
                EngineProtocolConstants.OP_ROOM_CREATE_REQ,
                1001L,
                42L,
                128L
        );

        byte[] encoded = header.encode();
        assertEquals(16, encoded.length, "Header length must be exactly 16 bytes");

        EngineHeader decoded = EngineHeader.decode(encoded);
        assertTrue(decoded.isValid());
        assertEquals(EngineProtocolConstants.MAGIC, decoded.getMagic());
        assertEquals(EngineProtocolConstants.VERSION, decoded.getVersion());
        assertEquals(EngineProtocolConstants.OP_ROOM_CREATE_REQ, decoded.getMsgType());
        assertEquals(1001L, decoded.getSeqId());
        assertEquals(42L, decoded.getClientId());
        assertEquals(128L, decoded.getPayloadLen());
    }

    @Test
    @DisplayName("Kiểm thử từ chối gói tin có độ dài nhỏ hơn 16 bytes")
    void testRejectShortBuffer() {
        byte[] shortBuf = new byte[15];
        assertThrows(IllegalArgumentException.class, () -> EngineHeader.decode(shortBuf));
    }

    @Test
    @DisplayName("Kiểm thử phát hiện Magic và Version không hợp lệ")
    void testInvalidMagic() {
        EngineHeader header = new EngineHeader((byte) 0x01, 1L, 1L, 10L);
        header.setMagic((short) 0x1234);
        assertFalse(header.isValid());
    }
}

