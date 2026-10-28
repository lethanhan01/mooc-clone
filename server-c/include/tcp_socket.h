#ifndef TCP_SOCKET_H
#define TCP_SOCKET_H

#include <stddef.h>
#include <stdbool.h>
#include <sys/types.h>
#include <netinet/in.h>

#define MAX_HOST_LEN 64
#define DEFAULT_LISTEN_BACKLOG 128
#define DEFAULT_BIND_HOST "0.0.0.0"
#define SEND_POLL_TIMEOUT_MS 2000

/**
 * @brief Cấu trúc quản lý trạng thái của TCP Listening Server.
 */
typedef struct {
    int listen_socket;
    int port;
    char host[MAX_HOST_LEN];
    bool is_nonblocking;
} tcp_server_t;

/**
 * @brief Cấu trúc lưu thông tin kết nối của một TCP Client sau khi accept().
 */
typedef struct {
    int client_socket;
    char client_ip[INET_ADDRSTRLEN];
    int client_port;
} tcp_client_conn_t;

/**
 * @brief Khởi tạo TCP server socket, cấu hình SO_REUSEADDR/SO_REUSEPORT, bind() và listen().
 *
 * Thực hiện đầy đủ chuỗi thiết lập mạng chuẩn: socket() -> setsockopt() -> bind() -> listen().
 * Nếu bất kỳ lời gọi hệ thống nào thất bại, hàm sẽ in nguyên nhân qua perror() và đóng
 * socket giải phóng tài nguyên trước khi thoát.
 *
 * @param[out] server  Con trỏ tới cấu trúc tcp_server_t cần khởi tạo.
 * @param[in]  host    Chuỗi địa chỉ IPv4 cần lắng nghe (truyền NULL hoặc rỗng để dùng 0.0.0.0).
 * @param[in]  port    Số hiệu cổng lắng nghe (1 - 65535).
 * @param[in]  backlog Kích thước hàng đợi kết nối chờ xử lý (listen backlog).
 * @return int 0 nếu thành công, -1 nếu có lỗi hệ thống.
 */
int tcp_server_init(tcp_server_t *server, const char *host, int port, int backlog);

/**
 * @brief Thiết lập chế độ bất đồng bộ (O_NONBLOCK) cho socket descriptor.
 *
 * Cần thiết khi đăng ký socket với cơ chế I/O multiplexing (epoll ở chế độ EPOLLET)
 * để đảm bảo các lời gọi accept(), recv(), send() không khóa cứng luồng sự kiện.
 *
 * @param[in] socket_fd Socket descriptor cần chuyển sang chế độ non-blocking.
 * @return int 0 nếu thành công, -1 nếu fcntl() gặp lỗi.
 */
int tcp_set_nonblocking(int socket_fd);

/**
 * @brief Chấp nhận một kết nối mới từ client ở chế độ đồng bộ (blocking).
 *
 * @param[in]  server Con trỏ tới cấu trúc server đang lắng nghe.
 * @param[out] conn   Con trỏ lưu thông tin socket và địa chỉ của client vừa kết nối.
 * @return int 0 nếu chấp nhận thành công, -1 nếu accept() gặp lỗi hoặc bị ngắt bởi tín hiệu.
 */
int tcp_server_accept(tcp_server_t *server, tcp_client_conn_t *conn);

/**
 * @brief Chấp nhận kết nối mới và thiết lập ngay cờ non-blocking cho client socket.
 *
 * Ưu tiên sử dụng lời gọi hệ thống accept4(..., SOCK_NONBLOCK) trên Linux để tiết kiệm
 * một lời gọi fcntl() bổ sung khi chạy dưới mô hình Doug Lea Reactor.
 *
 * @param[in]  server Con trỏ tới cấu trúc server đang lắng nghe.
 * @param[out] conn   Con trỏ lưu thông tin socket và địa chỉ của client vừa kết nối.
 * @return int 0 nếu thành công, -1 nếu hàng đợi rỗng (EAGAIN) hoặc có lỗi hệ thống.
 */
int tcp_server_accept_nonblocking(tcp_server_t *server, tcp_client_conn_t *conn);

/**
 * @brief Gửi toàn bộ dữ liệu qua TCP socket cho đến khi đủ số byte yêu cầu.
 *
 * Do TCP là giao thức hướng dòng byte (stream-oriented), một lần gọi send() có thể
 * chỉ đẩy đi được một phần dữ liệu. Hàm này lặp lại send() và chờ qua poll(POLLOUT)
 * nếu bộ đệm gửi của nhân mạng tạm thời đầy (EAGAIN/EWOULDBLOCK).
 *
 * @param[in] socket_fd Socket descriptor đang kết nối với client.
 * @param[in] buffer    Con trỏ vùng nhớ chứa dữ liệu cần gửi.
 * @param[in] length    Tổng số byte cần gửi đi.
 * @return ssize_t Tổng số byte đã gửi thành công, hoặc -1 nếu có lỗi mạng.
 */
ssize_t tcp_send_all(int socket_fd, const void *buffer, size_t length);

/**
 * @brief Đọc dữ liệu từ TCP socket vào bộ đệm.
 *
 * @param[in]  socket_fd  Socket descriptor đang kết nối.
 * @param[out] buffer     Bộ đệm lưu dữ liệu đọc được.
 * @param[in]  max_length Số byte tối đa có thể đọc vào bộ đệm.
 * @return ssize_t Số byte thực tế đọc được (> 0), 0 nếu client đóng kết nối (EOF),
 *                 hoặc -1 nếu có lỗi (hoặc EAGAIN trên non-blocking socket).
 */
ssize_t tcp_recv(int socket_fd, void *buffer, size_t max_length);

/**
 * @brief Đóng một socket descriptor an toàn và đặt lại giá trị về -1.
 *
 * Việc đặt lại descriptor về -1 giúp ngăn chặn lỗi đóng kép (double-close)
 * trên cùng một file descriptor trong môi trường đa luồng.
 *
 * @param[in,out] socket_fd Con trỏ tới biến lưu socket descriptor cần đóng.
 */
void tcp_close(int *socket_fd);

/**
 * @brief Đóng socket lắng nghe của TCP server và giải phóng tài nguyên mạng.
 *
 * @param[in,out] server Con trỏ tới cấu trúc tcp_server_t cần đóng.
 */
void tcp_server_close(tcp_server_t *server);

#endif // TCP_SOCKET_H
