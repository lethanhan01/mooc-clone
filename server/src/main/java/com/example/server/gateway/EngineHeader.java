package com.example.server.gateway;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;

/**
 * Đại diện cho Header cố định 16 bytes của giao thức C Communication Engine.
 */
public class EngineHeader {
    private short magic;
    private byte version;
    private byte msgType;
    private long seqId;      // Unsigned 32-bit int
    private long clientId;   // Unsigned 32-bit int
    private long payloadLen;  // Unsigned 32-bit int

    public EngineHeader() {
        this.magic = EngineProtocolConstants.MAGIC;
        this.version = EngineProtocolConstants.VERSION;
    }

    public EngineHeader(byte msgType, long seqId, long clientId, long payloadLen) {
        this.magic = EngineProtocolConstants.MAGIC;
        this.version = EngineProtocolConstants.VERSION;
        this.msgType = msgType;
        this.seqId = seqId;
        this.clientId = clientId;
        this.payloadLen = payloadLen;
    }

    public static EngineHeader decode(byte[] bytes) {
        if (bytes == null || bytes.length < EngineProtocolConstants.HEADER_SIZE) {
            throw new IllegalArgumentException("Header bytes must be at least 16 bytes");
        }
        ByteBuffer buf = ByteBuffer.wrap(bytes).order(ByteOrder.BIG_ENDIAN);
        EngineHeader h = new EngineHeader();
        h.magic = buf.getShort();
        h.version = buf.get();
        h.msgType = buf.get();
        h.seqId = Integer.toUnsignedLong(buf.getInt());
        h.clientId = Integer.toUnsignedLong(buf.getInt());
        h.payloadLen = Integer.toUnsignedLong(buf.getInt());
        return h;
    }

    public byte[] encode() {
        ByteBuffer buf = ByteBuffer.allocate(EngineProtocolConstants.HEADER_SIZE).order(ByteOrder.BIG_ENDIAN);
        buf.putShort(magic);
        buf.put(version);
        buf.put(msgType);
        buf.putInt((int) (seqId & 0xFFFFFFFFL));
        buf.putInt((int) (clientId & 0xFFFFFFFFL));
        buf.putInt((int) (payloadLen & 0xFFFFFFFFL));
        return buf.array();
    }

    public boolean isValid() {
        return magic == EngineProtocolConstants.MAGIC && version == EngineProtocolConstants.VERSION;
    }

    // Getters and Setters
    public short getMagic() { return magic; }
    public void setMagic(short magic) { this.magic = magic; }
    public byte getVersion() { return version; }
    public void setVersion(byte version) { this.version = version; }
    public byte getMsgType() { return msgType; }
    public void setMsgType(byte msgType) { this.msgType = msgType; }
    public long getSeqId() { return seqId; }
    public void setSeqId(long seqId) { this.seqId = seqId; }
    public long getClientId() { return clientId; }
    public void setClientId(long clientId) { this.clientId = clientId; }
    public long getPayloadLen() { return payloadLen; }
    public void setPayloadLen(long payloadLen) { this.payloadLen = payloadLen; }

    @Override
    public String toString() {
        return String.format("EngineHeader[type=0x%02X, seq=%d, client=%d, len=%d]",
                msgType, seqId, clientId, payloadLen);
    }
}

