# Quy Chuẩn Lập Trình Java Socket NIO & Backend Server (IT4062 - mooc-clone)

> **Học phần:** IT4062 - Lập Trình Mạng  
> **Dự án:** mooc-clone — Hệ thống Thi Trắc nghiệm Trực tuyến  
> **Phân hệ:** Máy chủ Backend & Dịch vụ Socket thời gian thực (`server/`)  
> **Nền tảng công nghệ:** Java 21 LTS, Spring Boot 3.4.x, Java NIO (Classic Reactor Pattern), Spring WebSocket, Jackson, JUnit 5  
> **Trạng thái:** Bắt buộc tuân thủ 100% đối với toàn bộ mã nguồn máy chủ và bài tập thực hành.

---

## 1. Naming & Constants (Đặt tên & Khai báo Hằng số)

- **Nguyên tắc cốt lõi:** Định danh phải phản ánh chính xác ngữ cảnh mạng, vòng đời tài nguyên và tính đồng thời.
- **Cấu trúc Package (`com.example.server.<domain>`):**
  - `socket.core`: Quản lý Selector, Reactor Loop, kết nối TCP Channel và vòng đời `ClientSession`.
  - `socket.protocol`: Cấu trúc khung gói tin (`PacketFrame`), hằng số mã lệnh (`ProtocolConstants`), bộ mã hóa (`PacketFramingEncoder`) và giải mã (`PacketFramingDecoder`).
  - `controller` & `service`: Cung cấp RESTful API Stateless kèm đồng hồ chuẩn máy chủ (`serverNow`, `endsAt`) phục vụ HTTP Short Polling cho trình duyệt Web.
- **Tên Lớp (Classes & Interfaces):** Sử dụng `PascalCase` rõ ràng theo đúng vai trò:
  - Máy chủ: `NioClassicReactorServer`
  - Quản lý phiên: `ClientSession`
  - Gói tin & Mã hóa: `PacketFrame`, `PacketFramingDecoder`, `PacketFramingEncoder`
  - Trạm điều phối sự kiện: `RoomEventBus`
- **Hằng số (`public static final`):** Sử dụng `UPPER_SNAKE_CASE`, tập trung tại các lớp Protocol hoặc Config:
  - `MAGIC`, `HEADER_SIZE`, `MAX_PAYLOAD_SIZE`, `OP_PING`, `OP_PONG`, `OP_JOIN_ROOM`, `OP_LEAVE_ROOM`, `OP_SUBMIT_ANSWER`, `OP_TIME_TICK`.
  - Tuyệt đối không dùng "hằng số ma thuật" (magic numbers) rải rác trong code logic (ví dụ: hardcode `0x4D43`, `8`, hoặc `9090`).
- **Biến, Tham số & Định danh Kênh Mạng:**
  - Sử dụng `camelCase` nhất quán, mang ý nghĩa trực quan.
  - Kênh lắng nghe server: `serverChannel` (`ServerSocketChannel`).
  - Kênh giao tiếp client: `sc` hoặc `clientChannel` (`SocketChannel`), `wsSession` (`WebSocketSession`).
  - Bộ đệm & Byte: `accumulationBuffer`, `payloadBuffer`, `bytesRead`, `payloadLength`.
  - Phương thức mạng đặt theo hành động: `handleAccept(SelectionKey key)`, `handleRead(SelectionKey key)`, `broadcastRoomUpdated(String roomId)`.

```java
// Nên dùng:
public final class ProtocolConstants {
    private ProtocolConstants() {}

    public static final short MAGIC = 0x4D43; // 'MC'
    public static final int HEADER_SIZE = 8;
    public static final int MAX_PAYLOAD_SIZE = 10 * 1024 * 1024; // 10MB

    public static final short OP_PING = 0x0001;
    public static final short OP_PONG = 0x0002;
    public static final short OP_JOIN_ROOM = 0x0010;
}

SocketChannel clientChannel = serverChannel.accept();
ByteBuffer accumulationBuffer = session.getAccumulationBuffer();
int bytesRead = clientChannel.read(accumulationBuffer);

// Không nên dùng:
public static final short magic = 19779;
int s, c, n;
ByteBuffer b = ByteBuffer.allocate(100);
```

---

## 2. Formatting & Code Structure (Định dạng & Cấu trúc Code Java 21)

- **Thụt lề:** Sử dụng **4 spaces**; tuyệt đối không dùng ký tự Tab hoặc trộn lẫn Tab và Spaces.
- **Dấu mở ngoặc nhọn `{`:** Đặt cùng dòng với câu lệnh điều khiển (`if`, `while`, `for`, `try`, `switch`) và khai báo lớp/hàm (chuẩn K&R / One True Brace Style).
- **Độ dài dòng:** Giới hạn tối đa 120 ký tự để dễ đọc và tương thích với các màn hình lập trình hiện đại.
- **Chuẩn cú pháp Java 21 hiện đại:**
  - **Pattern Matching cho `instanceof`:**
    ```java
    if (!(o instanceof PacketFrame that)) return false;
    ```
  - **Switch Expressions dạng mũi tên (`->`):**
    ```java
    switch (opcode) {
        case ProtocolConstants.OP_PING -> {
            ByteBuffer pong = PacketFramingEncoder.encode(ProtocolConstants.OP_PONG, "{\"status\":\"ok\"}");
            sendToTcpChannel(session.getChannel(), pong);
        }
        case ProtocolConstants.OP_JOIN_ROOM -> handleJoinRoom(session, jsonPayload);
        default -> log.warn("Unknown Opcode received: 0x{}", String.format("%04X", opcode));
    }
    ```
  - **Records cho các DTO bất biến:** Khuyến khích sử dụng Java Record cho các thông điệp dữ liệu nhẹ giữa các tầng.
- **Mô hình Doug Lea Classic Reactor Pattern:**
  - **Reactor Thread duy nhất (`nio-reactor-thread`):** Chuyên trách lắng nghe các sự kiện mạng non-blocking (`OP_ACCEPT`, `OP_READ`) từ `Selector`.
  - **Worker ThreadPool (`nio-worker-*`):** Nhận các khung gói tin đã giải mã để xử lý nghiệp vụ nặng, giải mã JSON payload, gọi dịch vụ phòng thi và broadcast.
  - **Quy tắc bất biến:** Tuyệt đối KHÔNG thực hiện các tác vụ blocking (I/O đĩa, sleep, truy vấn DB nặng) bên trong Reactor Thread làm nghẽn toàn bộ vòng lặp sự kiện mạng.

---

## 3. Socket NIO Programming Conventions (Quy ước Lập trình Socket Java)

### 3.1. Quản lý Tài nguyên, Vòng đời Kênh & Xử lý Lỗi
- **Nhận diện đóng kết nối (EOF / FIN):**
  - Khi phương thức `SocketChannel.read(buffer)` trả về `-1`, đây là tín hiệu Client đã đóng kết nối bình thường (hoặc ngắt kết nối đột ngột).
  - Phải xử lý hủy đăng ký khóa `SelectionKey`, đóng socket và thông báo rời phòng thi:
    ```java
    if (bytesRead == -1) {
        log.info("[NIO Reactor] Client disconnected: {}", session.getSessionId());
        key.cancel();
        try {
            sc.close();
        } catch (IOException ignored) {}
        workerPool.submit(() -> roomEventBus.handleTcpDisconnect(session));
        return;
    }
    ```
- **Xử lý Vi phạm Giao thức (Protocol Violation):**
  - Khi phát hiện sai `Magic Number` hoặc `payloadLength` vượt ngưỡng `MAX_PAYLOAD_SIZE`, máy chủ phải lập tức ngắt kênh để bảo vệ tài nguyên bộ nhớ trước các cuộc tấn công DoS/Flood.
- **Ghi log chuyên nghiệp với SLF4J:**
  - ❌ **TUYỆT ĐỐI CẤM:** Dùng `System.out.println()`, `System.err.println()`, hoặc `e.printStackTrace()`.
  - ✅ **BẮT BUỘC:** Sử dụng `org.slf4j.Logger` thông qua `LoggerFactory.getLogger(...)`.
  - Log rõ ràng: `log.info` cho sự kiện vòng đời kết nối, `log.warn` cho bất thường mạng hoặc vi phạm giao thức, `log.error` cho lỗi hệ thống kèm Exception object.

### 3.2. Quản lý Bộ đệm (`ByteBuffer`) & Thứ tự Byte (Byte Order)
- **Vòng đời trạng thái `ByteBuffer`:**
  - Luôn ghi nhớ quy luật chuyển đổi trạng thái của 3 con trỏ: `position`, `limit`, `capacity`.
  - **Ghi mạng vào Buffer:** Sau khi khởi tạo hoặc sau khi đọc hết, buffer ở trạng thái sẵn sàng nhận dữ liệu (`write mode`).
  - **Đọc Buffer (`flip()`):** Trước khi trích xuất dữ liệu hoặc giải mã gói tin, bắt buộc gọi `buffer.flip()` để chuyển sang chế độ đọc (`limit = position`, `position = 0`).
  - **Dồn đệm (`compact()`):** Khi giải mã xong một hoặc nhiều gói tin mà trong buffer vẫn còn dữ liệu dở dang (ví dụ header mới về được 4 bytes), gọi `buffer.compact()` để đưa dữ liệu chưa hoàn chỉnh về đầu mảng và đưa con trỏ về chế độ ghi tiếp theo.
  - **Đánh dấu & Phục hồi (`mark()` / `reset()`):** Sử dụng `accumulationBuffer.mark()` trước khi đọc Header. Nếu kiểm tra thấy payload chưa về đủ (`remaining() < payloadLength`), gọi `accumulationBuffer.reset()` để phục hồi con trỏ về trước Header và chờ lần đọc mạng tiếp theo.
- **Thứ tự Byte (Network Byte Order):**
  - Giao thức chuẩn mạng TCP quy định Big-Endian. Trong Java NIO, `ByteBuffer` mặc định là `ByteOrder.BIG_ENDIAN`.
  - Đọc/ghi các trường nhị phân qua các phương thức chuẩn: `putShort()`, `getShort()`, `putInt()`, `getInt()`. Không tự dịch bit thủ công trừ trường hợp tối ưu vi mô.
- **Chiến lược cấp phát Bộ đệm:**
  - Gắn một `accumulationBuffer` (kích thước đề xuất: 64KB) cho từng kết nối thông qua `ClientSession` (lưu trong `SelectionKey.attach()`), tránh cấp phát bộ nhớ mới liên tục gây áp lực Garbage Collection (GC pressure).

### 3.3. Đặc thù Giao thức Dòng TCP (Binary Framing, Chống Phân mảnh & Dính gói)
- **Bản chất truyền dòng (Stream-oriented):**
  - TCP là luồng byte liên tục không bảo toàn ranh giới thông điệp. Một lần gửi phía Client có thể bị chia nhỏ thành nhiều lần nhận hoặc gộp chung nhiều gói tin trong một lần đọc mạng.
- **Cấu trúc Đóng khung Nhị phân (Binary Frame Specification):**
  - Cấu trúc Header cố định 8 Bytes:
    ```text
    +---------------+---------------+-------------------------------+-----------------------+
    |  Magic (2B)   |  Opcode (2B)  |      Payload Length (4B)      |    Payload (N Bytes)  |
    |    0x4D43     |    0x0010     |          0x0000002A           |      JSON UTF-8       |
    +---------------+---------------+-------------------------------+-----------------------+
    ```
- **Giải quyết triệt để 2 vấn đề kinh điển của TCP:**
  - **Chống phân mảnh gói tin (Packet Fragmentation):** Xảy ra khi một gói tin bị xé nhỏ qua các khung truyền mạng. Bộ giải mã `PacketFramingDecoder` kiểm tra `remaining() >= HEADER_SIZE`. Nếu thiếu payload, dùng `mark()` và `reset()` giữ nguyên vị trí, không xử lý dở dang.
  - **Chống dính gói tin (Sticky Packets):** Xảy ra khi Client gửi nhanh nhiều gói tin liên tiếp khiến chúng nằm chung trong một lần `channel.read()`. Bộ giải mã chạy vòng lặp `while (remaining() >= HEADER_SIZE)` để bóc tách toàn bộ các gói tin hoàn chỉnh trong cùng một buffer.

### 3.4. Kiến trúc Kênh Kép (Dual-Channel) & Trạm Điều phối RoomEventBus
- **Hội tụ 2 kênh truyền:**
  - **Kênh TCP NIO (`Port 9090`):** Xử lý giao thức nhị phân framed protocol tốc độ cao cho các client thi chuyên dụng hoặc giả lập.
  - **Kênh Spring WebSocket (`Port 8080`):** Giao tiếp qua JSON text protocol với giao diện Web Browser (React Frontend).
- **Trạm sự kiện `RoomEventBus`:**
  - Đóng vai trò Mediator tập trung quản lý danh sách `roomTcpChannels` và `roomWebSessions`.
  - Đồng bộ trạng thái phòng thi song song tới cả 2 kênh qua các hàm:
    - `broadcastTimeTick(String roomId, int secondsRemaining)`
    - `broadcastRoomUpdated(String roomId)`
    - `broadcastExamFinished(String roomId, Map<String, Integer> scores)`
- **An toàn Đa luồng khi ghi Socket (Thread-Safe Socket Writes):**
  - Phương thức `SocketChannel.write()` và `WebSocketSession.sendMessage()` không an toàn khi bị gọi đồng thời từ nhiều luồng worker.
  - **Quy tắc bắt buộc:** Đồng bộ hóa trên đối tượng kênh khi ghi dữ liệu để tránh hiện tượng xen kẽ byte (interleaved frames):
    ```java
    private void sendToTcpChannel(SocketChannel channel, ByteBuffer buffer) {
        if (channel != null && channel.isOpen()) {
            try {
                synchronized (channel) {
                    while (buffer.hasRemaining()) {
                        channel.write(buffer);
                    }
                }
            } catch (IOException e) {
                log.warn("Failed to write to TCP channel, closing: {}", e.getMessage());
                try {
                    channel.close();
                } catch (IOException ignored) {}
            }
        }
    }
    ```

---

## 4. Concurrency & Commenting Guidelines (Quy ước Đa luồng & Chú thích)

### 4.1. Quy ước Xử lý Đồng thời (Concurrency Standards)
- **Cấu trúc Dữ liệu An toàn:** Luôn sử dụng các bộ sưu tập Concurrent cho tài nguyên dùng chung giữa các luồng:
  - Bảng tra cứu phòng & kênh: `ConcurrentHashMap<String, Set<SocketChannel>>`.
  - Tạo Set an toàn: `ConcurrentHashMap.newKeySet()`.
- **Trạng thái Biến:** Các biến cờ trạng thái kiểm soát vòng lặp hoặc thông tin phiên làm việc phải được khai báo `volatile` (ví dụ: `private volatile boolean isRunning`, `private volatile String currentRoomId`).
- **Phân định rõ ranh giới luồng:** Luồng Reactor I/O chỉ làm nhiệm vụ chấp nhận kết nối và đọc byte; toàn bộ logic tính điểm, kiểm tra câu hỏi phải chuyển giao cho `ExecutorService` (Worker ThreadPool).

### 4.2. Quy ước Chú thích mã nguồn
- **Nguyên tắc "Comment the WHY, not the WHAT":**
  - Chú thích phải giải thích **lý do kỹ thuật** đằng sau các quyết định thiết kế mạng, không dịch lại mã nguồn bằng lời.
  - *Nên viết:* `// Rewind con trỏ về trước Header và chờ lần đọc mạng tiếp theo do chưa đủ dữ liệu payload`
  - *Không nên viết:* `// Gọi hàm accumulationBuffer.reset()`
- **Bắt buộc chú thích ở các tình huống:**
  - Cơ chế bắt tay mạng, chuyển đổi trạng thái phiên làm việc (`ClientSession`).
  - Chiến lược xử lý biên bộ đệm `ByteBuffer` (`flip`, `compact`, `mark`, `reset`).
  - Các giải pháp đồng bộ đa luồng phòng tránh Race Condition.

---

## 5. Javadoc Standards (Chuẩn Tài liệu hóa API)

Mọi lớp công khai (`public class`), interface, hằng số giao thức và phương thức mạng quan trọng đều bắt buộc có Javadoc theo tiêu chuẩn Java SE:
- Mô tả mục đích và vai trò của component trong hệ thống mạng.
- Ghi rõ `@param`, `@return`, `@throws` và các lưu ý đặc thù về tính an toàn luồng (thread-safety).

```java
/**
 * Bộ giải mã khung gói tin (Packet Framing Decoder).
 * <p>
 * Xử lý triệt để 2 bài toán kinh điển của truyền dòng TCP:
 * <ul>
 *   <li><b>Chống phân mảnh gói tin (Fragmentation):</b> Giữ lại buffer nếu đọc thiếu header hoặc thiếu payload.</li>
 *   <li><b>Chống dính gói tin (Sticky Packets):</b> Tách chuẩn xác nhiều gói tin liên tiếp trong một buffer đọc.</li>
 * </ul>
 *
 * @param accumulationBuffer Bộ đệm tích lũy dữ liệu của kết nối (đã gọi {@code flip()})
 * @return Danh sách các đối tượng {@link PacketFrame} hoàn chỉnh được giải mã
 * @throws IllegalArgumentException nếu Magic Number không hợp lệ hoặc payloadLength vượt quá giới hạn cho phép
 */
public List<PacketFrame> decode(ByteBuffer accumulationBuffer) {
    // ...
}
```

---

## 6. Socket & Protocol Testing Conventions (Chuẩn Kiểm thử Socket & Giao thức)

Để đảm bảo tính toàn vẹn của cơ chế truyền dòng và giao thức nhị phân, mã nguồn máy chủ phải có bộ kiểm thử tự động sử dụng **JUnit 5**, **Mockito** và **AssertJ**:

### 6.1. Kiểm thử Tầng Giao thức (Unit Tests Framing)
- **Kiểm thử Đóng gói/Giải mã Tiêu chuẩn (Round-Trip Test):** Mã hóa một frame hợp lệ qua `PacketFramingEncoder` và giải mã qua `PacketFramingDecoder`, đối soát tính tương đương của opcode và payload.
- **Kiểm thử Chống Dính Gói (Sticky Packets Test):**
  - Đóng gói 2 hoặc nhiều frame liên tiếp vào cùng một `ByteBuffer`.
  - Giải mã và xác thực danh sách trả về chứa đủ số lượng frame với nội dung tương ứng.
- **Kiểm thử Chống Phân Mảnh (Fragmentation Test):**
  - Chia nhỏ một frame thành nhiều mẩu byte (ví dụ: mẩu 1 chứa 4 byte đầu của header, mẩu 2 chứa phần còn lại của header và 5 byte payload, mẩu 3 chứa nốt payload).
  - Nạp từng mẩu vào `accumulationBuffer` và gọi `decode()`. Xác minh chỉ khi mẩu cuối cùng được nạp thì frame mới được hoàn tất trích xuất.
- **Kiểm thử Ngoại lệ & Bảo mật (Edge Cases & Safety):**
  - Kiểm thử ném `IllegalArgumentException` khi Magic number không khớp với `0x4D43`.
  - Kiểm thử từ chối gói tin khi `payloadLength` âm hoặc vượt quá `MAX_PAYLOAD_SIZE` (10MB).

### 6.2. Kiểm thử Tích hợp Mạng (Integration Tests)
- Khởi chạy `NioClassicReactorServer` trên cổng kiểm thử độc lập.
- Sử dụng `SocketChannel` client kết nối trực tiếp, gửi gói tin `OP_PING` và xác thực nhận lại chính xác gói tin phản hồi `OP_PONG` từ máy chủ.
- Kiểm thử hành vi đóng kết nối đột ngột của client để đảm bảo server giải phóng socket và hủy `SelectionKey` an toàn, không rò rỉ tài nguyên.

---

## 7. Quick Review Checklist Trước Khi Commit (Definition of Done)

Bảng kiểm tra 8 tiêu chí cốt lõi dành cho lập trình viên và người đánh giá mã nguồn:

- [ ] **1. Đặt tên & Hằng số:** Tuân thủ `camelCase` / `PascalCase`, tuyệt đối không dùng magic numbers, mọi mã lệnh mạng nằm tại `ProtocolConstants`.
- [ ] **2. Reactor Non-blocking:** Không có bất kỳ tác vụ blocking (I/O đĩa, sleep, truy vấn nặng) nào chạy trên luồng `nio-reactor-thread`.
- [ ] **3. Vòng đời ByteBuffer:** Gọi `flip()` trước khi đọc dữ liệu và `compact()` sau khi giải mã dở dang; sử dụng `mark()`/`reset()` an toàn.
- [ ] **4. Đóng Kênh An Toàn:** Đã xử lý `bytesRead == -1`, hủy `SelectionKey`, đóng `SocketChannel` và thông báo rời phòng thi trên luồng Worker.
- [ ] **5. An toàn Đa luồng:** Mọi thao tác ghi mạng (`SocketChannel.write` / `WebSocketSession.sendMessage`) đều được đồng bộ hóa (`synchronized`).
- [ ] **6. Ghi Log Chuẩn:** Sử dụng 100% SLF4J `Logger`, không còn `System.out.println` hay `e.printStackTrace()` trong mã nguồn.
- [ ] **7. Javadoc:** Mọi phương thức công khai và cấu trúc gói tin đều có Javadoc giải thích rõ ràng tham số và điều kiện biên.
- [ ] **8. Kiểm thử Tự động:** Bộ kiểm thử đơn vị và tích hợp chạy thành công 100% (`./mvnw test`).
