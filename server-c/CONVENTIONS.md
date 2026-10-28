# Coding Conventions - IT4062: Lập Trình Mạng

Tài liệu quy chuẩn lập trình chung áp dụng cho toàn bộ các bài tập thực hành môn Lập Trình Mạng (IT4062).

---

## 1. Naming & Constants (Đặt tên & Khai báo Hằng số)

- **Nguyên tắc cốt lõi:** Tên gọi phải giúp người đọc hiểu ngay vai trò, phạm vi và kiểu tài nguyên.
  - **Hằng số (`#define` / `const`):** Sử dụng `UPPER_SNAKE_CASE` (ví dụ: `SERVER_PORT`, `BUFFER_SIZE`, `LISTEN_BACKLOG`, `MAX_ATTEMPTS`).
  - **Biến và Hàm:** Sử dụng `camelCase` hoặc `snake_case` một cách nhất quán trong toàn bộ file; tên phải thể hiện rõ hành động hoặc đối tượng.
  - **Tránh tên mơ hồ:** Tuyệt đối tránh các tên biến 1 ký tự hoặc chung chung (`s`, `c`, `tmp`, `x`, `n`) trừ các biến đếm vòng lặp thông thường (`i`, `j`, `k`).
  - **Phân biệt rõ định danh Socket:**
    - TCP Server: `listenSocket` (socket lắng nghe kết nối), `clientSocket` hoặc `connectionSocket` (socket giao tiếp với client cụ thể sau `accept()`).
    - UDP Server / Client: `serverSocket`, `clientSocket`.
    - Biến đếm byte: `bytesReceived`, `bytesSent`, `totalBytesRead`.

```c
// Nên dùng:
#define SERVER_PORT 5500
#define BUFFER_SIZE 1024
#define LISTEN_BACKLOG 10
#define MAX_FAILED_ATTEMPTS 3

int listenSocket;
int clientSocket;
ssize_t bytesReceived;
ssize_t bytesSent;
struct sockaddr_in serverAddress;
struct sockaddr_in clientAddress;

// Không nên dùng:
#define PORT 5500
int s, c, n;
```

---

## 2. Formatting & Code Structure (Định dạng & Cấu trúc Code)

- Sử dụng **4 spaces** để thụt lề; tuyệt đối không trộn lẫn giữa Tab và Spaces.
- Dấu mở ngoặc nhọn `{` đặt cùng dòng với câu lệnh điều khiển (`if`, `while`, `for`) hoặc khai báo hàm (K&R / One True Brace Style).
- Mỗi dòng lệnh ngắn gọn, giới hạn tối đa 100 ký tự để dễ đọc trên mọi màn hình.
- Cấu trúc hàm logic, phân tách rõ ràng các bước thiết lập mạng:
  - **TCP Server:** `socket()` → `setsockopt()` → `bind()` → `listen()` → `accept()` → `recv()` / `send()` → `close()`.
  - **TCP Client:** `socket()` → `connect()` → `send()` / `recv()` → `close()`.
  - **UDP:** `socket()` → `bind()` (phía server) → `recvfrom()` / `sendto()` → `close()`.

```c
// Chuẩn kiểm tra và khởi tạo socket:
if ((listenSocket = socket(AF_INET, SOCK_STREAM, 0)) == -1) {
    perror("socket");
    return EXIT_FAILURE;
}

// Thiết lập SO_REUSEADDR để tránh lỗi "Address already in use" khi restart server
int opt = 1;
if (setsockopt(listenSocket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
    perror("setsockopt SO_REUSEADDR");
    close(listenSocket);
    return EXIT_FAILURE;
}

// Gán địa chỉ server vào socket
if (bind(listenSocket, (struct sockaddr *)&serverAddress, sizeof(serverAddress)) == -1) {
    perror("bind");
    close(listenSocket);
    return EXIT_FAILURE;
}
```

---

## 3. Socket Programming Conventions (Quy ước Lập trình Socket)

### 3.1. Xử lý lỗi & Trả về
- **Luôn kiểm tra giá trị trả về** của mọi lời gọi hệ thống (system call): `socket()`, `bind()`, `listen()`, `accept()`, `connect()`, `recv()`, `send()`, `recvfrom()`, `sendto()`, `close()`.
- Khi system call trả về lỗi (`-1`), sử dụng `perror()` hoặc `strerror(errno)` để in chi tiết nguyên nhân lỗi ra `stderr`.
- Luôn giải phóng tài nguyên mạng (`close(sock)`) và bộ nhớ (`free()`) trước khi thoát hoặc xử lý lỗi rẽ nhánh.

### 3.2. Byte Order & Địa chỉ Mạng
- Chuyển đổi số hiệu cổng và địa chỉ sang Network Byte Order (Big-Endian):
  - Cổng: `htons(port)` (Host to Network Short), `ntohs(port)`.
  - Địa chỉ IP: Sử dụng `inet_pton()` và `inet_ntop()` để chuyển đổi giữa chuỗi văn bản và cấu trúc `in_addr`, không dùng các hàm cũ/lỗi thời như `inet_addr()`.
- Tuyệt đối không dùng "hằng số ma thuật" (magic numbers): luôn định nghĩa qua `#define` hoặc `enum`.

### 3.3. Đặc thù Giao thức TCP (`SOCK_STREAM`)
- **Bản chất dòng byte (Stream-oriented):** TCP không bảo toàn ranh giới thông điệp. Một lần `send()` phía gửi có thể bị phân mảnh hoặc gộp thành nhiều lần `recv()` phía nhận.
- **Xử lý Partial Read/Write:**
  - Không bao giờ giả định một lần gọi `recv()` hay `send()` sẽ nhận/gửi đủ toàn bộ thông điệp.
  - Phải hiện thực cơ chế gửi/nhận đủ qua vòng lặp (hàm `send_all()` / `recv_all()`).
- **Đóng khung thông điệp (Application-level Framing):**
  - Cần quy định ranh giới gói tin ứng dụng rõ ràng: hoặc sử dụng ký tự phân cách (ví dụ ký tự `\n`), hoặc đính kèm độ dài thông điệp ở phần Header (ví dụ: `STR <len>\n` hoặc cấu trúc fixed header có trường `uint32_t length`).
- **Nhận diện đóng kết nối:** Khi `recv()` trả về `0`, đó là tín hiệu Client đã đóng kết nối (EOF / FIN) bình thường.

### 3.4. Đặc thù Giao thức UDP (`SOCK_DGRAM`)
- **Bản chất Datagram:** UDP bảo toàn trọn vẹn ranh giới gói tin. Mỗi lần `recvfrom()` đọc trọn vẹn 1 datagram hoặc bị cắt ngắn nếu bộ đệm quá nhỏ.
- **Tính phi kết nối (Connectionless):**
  - Phía Server không có `accept()` hay socket riêng cho từng client.
  - Server phải lưu giữ `struct sockaddr_in clientAddr` từ mỗi gói tin nhận được qua `recvfrom()` để phản hồi lại chính xác địa chỉ và ephemeral port đó qua `sendto()`.
  - Phân biệt phiên (session) giữa các client thông qua cặp `(Client_IP, Client_Port)`.

---

## 4. Commenting Guidelines (Quy ước Chú thích)

- **Nguyên tắc "Comment the WHY, not the WHAT":**
  - Giải thích **lý do** đưa ra quyết định thiết kế hoặc logic xử lý đặc thù mạng, không chỉ dịch lại mã lệnh bằng lời nói.
  - *Nên viết:* `// Tránh Zombie process bằng cách bắt tín hiệu SIGCHLD và gọi waitpid`
  - *Không nên viết:* `// Gọi hàm signal`
- **Nên chú thích khi:**
  - Giải thích định dạng giao thức và cấu trúc gói tin.
  - Xử lý các điều kiện biên: EOF, kết nối bị reset, timeout, partial send/recv.
  - Giải thích cơ chế đồng thời (đa tiến trình `fork()`, I/O multiplexing `select()` / `poll()`).
- **Không nên chú thích khi:**
  - Mã lệnh đã quá tường minh (ví dụ: `i++; // tăng i lên 1`).

---

## 5. Doxygen Docstrings (Chuẩn tài liệu hóa hàm)

Mọi hàm tiện ích trong file header (`.h`) hoặc hàm xử lý quan trọng cần có chú thích chuẩn Doxygen:

```c
/**
 * @brief Gửi toàn bộ dữ liệu qua TCP socket cho đến khi đủ số byte yêu cầu.
 * 
 * Do send() có thể gửi ít hơn số byte mong muốn, hàm này lặp lại send()
 * cho đến khi gửi hết buffer hoặc gặp lỗi đường truyền.
 * 
 * @param[in] socketFd Socket descriptor đang kết nối.
 * @param[in] buffer Con trỏ vùng nhớ chứa dữ liệu cần gửi.
 * @param[in] length Tổng số byte cần gửi đi.
 * @return ssize_t Tổng số byte đã gửi thành công, hoặc -1 nếu có lỗi mạng.
 */
ssize_t sendAll(int socketFd, const void *buffer, size_t length);

/**
 * @brief Kiểm tra tính hợp lệ và chuyển đổi chuỗi cổng sang số nguyên.
 * 
 * @param[in] portString Chuỗi văn bản nhập từ tham số dòng lệnh.
 * @param[out] outPort Con trỏ lưu giá trị cổng nguyên sau khi xác thực.
 * @return int 1 nếu cổng nằm trong dải hợp lệ (1 - 65535), 0 nếu không hợp lệ.
 */
int validatePort(const char *portString, int *outPort);
```
