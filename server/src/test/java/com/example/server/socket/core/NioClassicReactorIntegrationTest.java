package com.example.server.socket.core;

import com.example.server.entity.ExamRoomEntity;
import com.example.server.entity.UserEntity;
import com.example.server.entity.enums.RoomStatus;
import com.example.server.entity.enums.RoomVisibility;
import com.example.server.entity.enums.SystemRole;
import com.example.server.entity.enums.UserStatus;
import com.example.server.repository.ExamRoomRepository;
import com.example.server.repository.UserRepository;
import com.example.server.socket.protocol.PacketFrame;
import com.example.server.socket.protocol.PacketFramingDecoder;
import com.example.server.socket.protocol.PacketFramingEncoder;
import com.example.server.socket.protocol.ProtocolConstants;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SocketChannel;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@DisplayName("Kiểm thử Tích hợp Lõi Socket TCP NIO (Classic Reactor Pattern)")
class NioClassicReactorIntegrationTest {

    @Autowired
    private NioClassicReactorServer reactorServer;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExamRoomRepository examRoomRepository;

    @BeforeEach
    void setUp() {
        UserEntity student = userRepository.findByUsername("student_99").orElseGet(() -> {
            UserEntity u = new UserEntity();
            u.setUsername("student_99");
            u.setDisplayName("Thí sinh 99");
            u.setEmail("student_99@mooc.local");
            u.setPasswordHash("$2a$10$dummyHashPass");
            u.setSystemRole(SystemRole.USER);
            u.setStatus(UserStatus.ACTIVE);
            return userRepository.save(u);
        });

        examRoomRepository.findByRoomCode("ROOM_TEST_99").orElseGet(() -> {
            ExamRoomEntity r = new ExamRoomEntity();
            r.setRoomCode("ROOM_TEST_99");
            r.setName("Phòng thi NIO 99");
            r.setDescription("Phòng test NIO");
            r.setOwner(student);
            r.setTopic("Lập Trình Mạng");
            r.setEasyCount(5);
            r.setMediumCount(3);
            r.setHardCount(2);
            r.setVisibility(RoomVisibility.PUBLIC);
            r.setStatus(RoomStatus.WAITING);
            r.setDurationSeconds(300);
            return examRoomRepository.save(r);
        });
    }

    @Test
    @DisplayName("Kết nối TCP Socket thực tế, gửi OP_PING và nhận phản hồi OP_PONG")
    void testTcpPingPong() throws IOException {
        int serverPort = reactorServer.getPort();
        assertThat(reactorServer.isRunning()).isTrue();

        try (SocketChannel client = SocketChannel.open(new InetSocketAddress("localhost", serverPort))) {
            client.configureBlocking(true);

            // Gửi gói tin OP_PING có gắn 8-byte header
            ByteBuffer pingFrame = PacketFramingEncoder.encode(ProtocolConstants.OP_PING, "{\"client\":\"junit\"}");
            client.write(pingFrame);

            // Đọc phản hồi từ server
            ByteBuffer readBuffer = ByteBuffer.allocate(4096);
            int bytesRead = client.read(readBuffer);
            assertThat(bytesRead).isGreaterThan(0);

            readBuffer.flip();
            PacketFramingDecoder decoder = new PacketFramingDecoder();
            List<PacketFrame> responseFrames = decoder.decode(readBuffer);

            assertThat(responseFrames).isNotEmpty();
            PacketFrame pong = responseFrames.get(0);
            assertThat(pong.getOpcode()).isEqualTo(ProtocolConstants.OP_PONG);
            assertThat(pong.getPayloadAsString()).contains("ok");
        }
    }

    @Test
    @DisplayName("Client gửi OP_JOIN_ROOM qua TCP và nhận khung OP_ROOM_UPDATED broadcast từ Server")
    void testTcpJoinRoomAndBroadcast() throws IOException {
        int serverPort = reactorServer.getPort();

        try (SocketChannel client = SocketChannel.open(new InetSocketAddress("localhost", serverPort))) {
            client.configureBlocking(true);

            String joinJson = "{\"roomId\":\"ROOM_TEST_99\",\"userId\":\"student_99\",\"userName\":\"Thí sinh 99\"}";
            ByteBuffer joinFrame = PacketFramingEncoder.encode(ProtocolConstants.OP_JOIN_ROOM, joinJson);
            client.write(joinFrame);

            // Đọc gói tin broadcast OP_ROOM_UPDATED từ Server
            ByteBuffer readBuffer = ByteBuffer.allocate(4096);
            int bytesRead = client.read(readBuffer);
            assertThat(bytesRead).isGreaterThan(0);

            readBuffer.flip();
            PacketFramingDecoder decoder = new PacketFramingDecoder();
            List<PacketFrame> responseFrames = decoder.decode(readBuffer);

            assertThat(responseFrames).isNotEmpty();
            PacketFrame updateFrame = responseFrames.get(0);
            assertThat(updateFrame.getOpcode()).isEqualTo(ProtocolConstants.OP_ROOM_UPDATED);
            assertThat(updateFrame.getPayloadAsString()).contains("ROOM_TEST_99");
        }
    }

    @Test
    @DisplayName("Client gửi OP_JOIN_ROOM với phòng không tồn tại nhận phản hồi OP_ERROR")
    void testTcpJoinNonExistentRoomReceivesOpError() throws IOException {
        int serverPort = reactorServer.getPort();

        try (SocketChannel client = SocketChannel.open(new InetSocketAddress("localhost", serverPort))) {
            client.configureBlocking(true);

            String joinJson = "{\"roomId\":\"NON_EXIST_999\",\"userId\":\"student_99\",\"userName\":\"Thí sinh 99\"}";
            ByteBuffer joinFrame = PacketFramingEncoder.encode(ProtocolConstants.OP_JOIN_ROOM, joinJson);
            client.write(joinFrame);

            // Đọc gói tin phản hồi OP_ERROR từ Server
            ByteBuffer readBuffer = ByteBuffer.allocate(4096);
            int bytesRead = client.read(readBuffer);
            assertThat(bytesRead).isGreaterThan(0);

            readBuffer.flip();
            PacketFramingDecoder decoder = new PacketFramingDecoder();
            List<PacketFrame> responseFrames = decoder.decode(readBuffer);

            assertThat(responseFrames).isNotEmpty();
            PacketFrame errorFrame = responseFrames.get(0);
            assertThat(errorFrame.getOpcode()).isEqualTo(ProtocolConstants.OP_ERROR);
            assertThat(errorFrame.getPayloadAsString()).contains("ROOM_NOT_FOUND");
        }
    }
}
