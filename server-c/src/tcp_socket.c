#include "tcp_socket.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <poll.h>
#include <arpa/inet.h>
#include <sys/socket.h>

#ifndef MSG_NOSIGNAL
#define MSG_NOSIGNAL 0
#endif

int tcp_server_init(tcp_server_t *server, const char *host, int port, int backlog) {
    if (!server) {
        return -1;
    }

    memset(server, 0, sizeof(tcp_server_t));
    server->listen_socket = -1;
    server->port = port;

    if (host && strlen(host) > 0) {
        strncpy(server->host, host, sizeof(server->host) - 1);
    } else {
        strncpy(server->host, DEFAULT_BIND_HOST, sizeof(server->host) - 1);
    }

    int listen_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (listen_socket < 0) {
        perror("[TCP] socket");
        return -1;
    }

    // Bật SO_REUSEADDR để cho phép bind lại cổng ngay lập tức khi khởi động lại server
    // mà không bị kẹt ở trạng thái TIME_WAIT của các kết nối cũ.
    int opt = 1;
    if (setsockopt(listen_socket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
        perror("[TCP] setsockopt SO_REUSEADDR");
        if (close(listen_socket) < 0) {
            perror("[TCP] close");
        }
        return -1;
    }

#ifdef SO_REUSEPORT
    if (setsockopt(listen_socket, SOL_SOCKET, SO_REUSEPORT, &opt, sizeof(opt)) < 0) {
        perror("[TCP] setsockopt SO_REUSEPORT");
    }
#endif

    struct sockaddr_in server_address;
    memset(&server_address, 0, sizeof(server_address));
    server_address.sin_family = AF_INET;
    server_address.sin_port = htons((uint16_t)port);

    if (inet_pton(AF_INET, server->host, &server_address.sin_addr) <= 0) {
        perror("[TCP] inet_pton");
        if (close(listen_socket) < 0) {
            perror("[TCP] close");
        }
        return -1;
    }

    if (bind(listen_socket, (struct sockaddr *)&server_address, sizeof(server_address)) < 0) {
        perror("[TCP] bind");
        if (close(listen_socket) < 0) {
            perror("[TCP] close");
        }
        return -1;
    }

    int effective_backlog = backlog > 0 ? backlog : DEFAULT_LISTEN_BACKLOG;
    if (listen(listen_socket, effective_backlog) < 0) {
        perror("[TCP] listen");
        if (close(listen_socket) < 0) {
            perror("[TCP] close");
        }
        return -1;
    }

    server->listen_socket = listen_socket;
    server->is_nonblocking = false;
    return 0;
}

int tcp_set_nonblocking(int socket_fd) {
    if (socket_fd < 0) {
        return -1;
    }

    int flags = fcntl(socket_fd, F_GETFL, 0);
    if (flags == -1) {
        perror("[TCP] fcntl F_GETFL");
        return -1;
    }

    if (fcntl(socket_fd, F_SETFL, flags | O_NONBLOCK) == -1) {
        perror("[TCP] fcntl F_SETFL O_NONBLOCK");
        return -1;
    }

    return 0;
}

int tcp_server_accept(tcp_server_t *server, tcp_client_conn_t *conn) {
    if (!server || server->listen_socket < 0 || !conn) {
        return -1;
    }

    struct sockaddr_in client_address;
    socklen_t address_len = sizeof(client_address);
    memset(&client_address, 0, sizeof(client_address));

    int client_socket = accept(server->listen_socket,
                               (struct sockaddr *)&client_address,
                               &address_len);
    if (client_socket < 0) {
        // Khi nhận tín hiệu tắt server (SIGINT/SIGTERM), accept() bị ngắt với EINTR.
        // Không coi đây là lỗi hệ thống bất thường để quá trình graceful shutdown diễn ra êm.
        if (errno != EINTR && errno != EAGAIN && errno != EWOULDBLOCK) {
            perror("[TCP] accept");
        }
        return -1;
    }

    if (!inet_ntop(AF_INET, &client_address.sin_addr, conn->client_ip, sizeof(conn->client_ip))) {
        perror("[TCP] inet_ntop");
        tcp_close(&client_socket);
        return -1;
    }

    conn->client_socket = client_socket;
    conn->client_port = ntohs(client_address.sin_port);
    return 0;
}

int tcp_server_accept_nonblocking(tcp_server_t *server, tcp_client_conn_t *conn) {
    if (!server || server->listen_socket < 0 || !conn) {
        return -1;
    }

    struct sockaddr_in client_address;
    socklen_t address_len = sizeof(client_address);
    memset(&client_address, 0, sizeof(client_address));

#ifdef SOCK_NONBLOCK
    int client_socket = accept4(server->listen_socket,
                                (struct sockaddr *)&client_address,
                                &address_len,
                                SOCK_NONBLOCK);
#else
    int client_socket = accept(server->listen_socket,
                               (struct sockaddr *)&client_address,
                               &address_len);
    if (client_socket >= 0) {
        if (tcp_set_nonblocking(client_socket) < 0) {
            tcp_close(&client_socket);
            return -1;
        }
    }
#endif

    if (client_socket < 0) {
        // Trong vòng lặp epoll EPOLLET, accept4() được gọi liên tục cho tới khi trả về EAGAIN
        // (báo hiệu đã lấy hết kết nối đang chờ trong backlog của nhân).
        if (errno != EAGAIN && errno != EWOULDBLOCK && errno != EINTR) {
            perror("[TCP] accept4");
        }
        return -1;
    }

    if (!inet_ntop(AF_INET, &client_address.sin_addr, conn->client_ip, sizeof(conn->client_ip))) {
        perror("[TCP] inet_ntop");
        tcp_close(&client_socket);
        return -1;
    }

    conn->client_socket = client_socket;
    conn->client_port = ntohs(client_address.sin_port);
    return 0;
}

ssize_t tcp_send_all(int socket_fd, const void *buffer, size_t length) {
    if (socket_fd < 0 || !buffer) {
        return -1;
    }

    size_t total_bytes_sent = 0;
    const char *data_ptr = (const char *)buffer;

    // Vòng lặp xử lý Partial Write: đảm bảo đẩy hết toàn bộ 'length' byte qua TCP stream
    while (total_bytes_sent < length) {
        ssize_t bytes_sent = send(socket_fd,
                                  data_ptr + total_bytes_sent,
                                  length - total_bytes_sent,
                                  MSG_NOSIGNAL);
        if (bytes_sent <= 0) {
            if (bytes_sent < 0 && errno == EINTR) {
                // Lời gọi bị ngắt tạm thời bởi signal hệ thống -> thử gửi lại
                continue;
            }
            if (bytes_sent < 0 && (errno == EAGAIN || errno == EWOULDBLOCK)) {
                // Bộ đệm gửi của kernel trên non-blocking socket đang đầy -> dùng poll chờ POLLOUT
                struct pollfd poll_desc;
                poll_desc.fd = socket_fd;
                poll_desc.events = POLLOUT;
                poll_desc.revents = 0;

                int poll_res = poll(&poll_desc, 1, SEND_POLL_TIMEOUT_MS);
                if (poll_res < 0 && errno != EINTR) {
                    perror("[TCP] poll POLLOUT");
                    return -1;
                }
                if (poll_res > 0 &&
                    (poll_desc.revents & POLLOUT) &&
                    !(poll_desc.revents & (POLLERR | POLLHUP))) {
                    continue;
                }
                return -1;
            }
            if (bytes_sent < 0) {
                perror("[TCP] send");
            }
            return -1;
        }
        total_bytes_sent += (size_t)bytes_sent;
    }

    return (ssize_t)total_bytes_sent;
}

ssize_t tcp_recv(int socket_fd, void *buffer, size_t max_length) {
    if (socket_fd < 0 || !buffer) {
        return -1;
    }

    ssize_t bytes_received = recv(socket_fd, buffer, max_length, 0);
    if (bytes_received < 0) {
        // Không in perror cho EAGAIN/EWOULDBLOCK (trạng thái bình thường của non-blocking I/O)
        // hoặc EINTR (khi có tín hiệu ngắt).
        if (errno != EAGAIN && errno != EWOULDBLOCK && errno != EINTR) {
            perror("[TCP] recv");
        }
    }
    return bytes_received;
}

void tcp_close(int *socket_fd) {
    if (socket_fd && *socket_fd >= 0) {
        if (close(*socket_fd) < 0) {
            perror("[TCP] close");
        }
        *socket_fd = -1;
    }
}

void tcp_server_close(tcp_server_t *server) {
    if (server && server->listen_socket >= 0) {
        tcp_close(&server->listen_socket);
    }
}
