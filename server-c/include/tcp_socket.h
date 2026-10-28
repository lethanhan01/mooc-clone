#ifndef TCP_SOCKET_H
#define TCP_SOCKET_H

#include <stddef.h>
#include <stdbool.h>
#include <sys/types.h>
#include <netinet/in.h>

typedef struct {
    int server_fd;
    int port;
    char host[64];
    bool is_nonblocking;
} tcp_server_t;

typedef struct {
    int client_fd;
    char client_ip[INET_ADDRSTRLEN];
    int client_port;
} tcp_client_conn_t;

// Khởi tạo socket, cấu hình SO_REUSEADDR/SO_REUSEPORT, bind và listen
int tcp_server_init(tcp_server_t *server, const char *host, int port, int backlog);

// Đặt cờ O_NONBLOCK cho file descriptor
int tcp_set_nonblocking(int fd);

// Chấp nhận một kết nối mới (chế độ blocking)
int tcp_server_accept(tcp_server_t *server, tcp_client_conn_t *conn);

// Chấp nhận một kết nối mới với cờ SOCK_NONBLOCK (dùng cho epoll ở Giai đoạn 4)
int tcp_server_accept_nonblocking(tcp_server_t *server, tcp_client_conn_t *conn);

// Gửi bảo đảm toàn bộ 'len' bytes (xử lý partial send)
ssize_t tcp_send_all(int fd, const void *buf, size_t len);

// Đọc dữ liệu từ socket an toàn
ssize_t tcp_recv(int fd, void *buf, size_t max_len);

// Đóng socket và đặt FD về -1
void tcp_close(int *fd);

// Dừng server socket
void tcp_server_close(tcp_server_t *server);

#endif // TCP_SOCKET_H
