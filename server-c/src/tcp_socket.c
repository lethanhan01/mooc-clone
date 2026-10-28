#include "tcp_socket.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <arpa/inet.h>
#include <sys/socket.h>

#ifndef MSG_NOSIGNAL
#define MSG_NOSIGNAL 0
#endif

int tcp_server_init(tcp_server_t *server, const char *host, int port, int backlog) {
    if (!server) return -1;
    memset(server, 0, sizeof(tcp_server_t));
    server->server_fd = -1;
    server->port = port;
    if (host && strlen(host) > 0) {
        strncpy(server->host, host, sizeof(server->host) - 1);
    } else {
        strncpy(server->host, "0.0.0.0", sizeof(server->host) - 1);
    }

    int fd = socket(AF_INET, SOCK_STREAM, 0);
    if (fd < 0) {
        perror("[TCP] socket() creation failed");
        return -1;
    }

    int opt = 1;
    if (setsockopt(fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
        perror("[TCP] setsockopt(SO_REUSEADDR) failed");
        close(fd);
        return -1;
    }

#ifdef SO_REUSEPORT
    if (setsockopt(fd, SOL_SOCKET, SO_REUSEPORT, &opt, sizeof(opt)) < 0) {
        perror("[TCP] setsockopt(SO_REUSEPORT) failed");
    }
#endif

    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = htons((uint16_t)port);

    if (inet_pton(AF_INET, server->host, &addr.sin_addr) <= 0) {
        perror("[TCP] inet_pton() failed");
        close(fd);
        return -1;
    }

    if (bind(fd, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
        perror("[TCP] bind() failed");
        close(fd);
        return -1;
    }

    if (listen(fd, backlog > 0 ? backlog : 128) < 0) {
        perror("[TCP] listen() failed");
        close(fd);
        return -1;
    }

    server->server_fd = fd;
    server->is_nonblocking = false;
    return 0;
}

int tcp_set_nonblocking(int fd) {
    if (fd < 0) return -1;
    int flags = fcntl(fd, F_GETFL, 0);
    if (flags == -1) return -1;
    return fcntl(fd, F_SETFL, flags | O_NONBLOCK);
}

int tcp_server_accept(tcp_server_t *server, tcp_client_conn_t *conn) {
    if (!server || server->server_fd < 0 || !conn) return -1;
    struct sockaddr_in client_addr;
    socklen_t addr_len = sizeof(client_addr);
    memset(&client_addr, 0, sizeof(client_addr));

    int client_fd = accept(server->server_fd, (struct sockaddr *)&client_addr, &addr_len);
    if (client_fd < 0) {
        return -1;
    }

    conn->client_fd = client_fd;
    conn->client_port = ntohs(client_addr.sin_port);
    inet_ntop(AF_INET, &client_addr.sin_addr, conn->client_ip, sizeof(conn->client_ip));
    return 0;
}

int tcp_server_accept_nonblocking(tcp_server_t *server, tcp_client_conn_t *conn) {
    if (!server || server->server_fd < 0 || !conn) return -1;
    struct sockaddr_in client_addr;
    socklen_t addr_len = sizeof(client_addr);
    memset(&client_addr, 0, sizeof(client_addr));

#ifdef SOCK_NONBLOCK
    int client_fd = accept4(server->server_fd, (struct sockaddr *)&client_addr, &addr_len, SOCK_NONBLOCK);
#else
    int client_fd = accept(server->server_fd, (struct sockaddr *)&client_addr, &addr_len);
    if (client_fd >= 0) {
        tcp_set_nonblocking(client_fd);
    }
#endif

    if (client_fd < 0) {
        return -1;
    }

    conn->client_fd = client_fd;
    conn->client_port = ntohs(client_addr.sin_port);
    inet_ntop(AF_INET, &client_addr.sin_addr, conn->client_ip, sizeof(conn->client_ip));
    return 0;
}

ssize_t tcp_send_all(int fd, const void *buf, size_t len) {
    if (fd < 0 || !buf) return -1;
    size_t total_sent = 0;
    const char *ptr = (const char *)buf;

    while (total_sent < len) {
        ssize_t sent = send(fd, ptr + total_sent, len - total_sent, MSG_NOSIGNAL);
        if (sent <= 0) {
            if (sent < 0 && (errno == EINTR)) {
                continue;
            }
            return -1;
        }
        total_sent += (size_t)sent;
    }
    return (ssize_t)total_sent;
}

ssize_t tcp_recv(int fd, void *buf, size_t max_len) {
    if (fd < 0 || !buf) return -1;
    return recv(fd, buf, max_len, 0);
}

void tcp_close(int *fd) {
    if (fd && *fd >= 0) {
        close(*fd);
        *fd = -1;
    }
}

void tcp_server_close(tcp_server_t *server) {
    if (server && server->server_fd >= 0) {
        tcp_close(&server->server_fd);
    }
}
