#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>
#include <errno.h>
#include <poll.h>
#include <fcntl.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#include "engine_protocol.h"
#include "tcp_socket.h"

#define DEFAULT_GATEWAY_PORT 9000
#define MAX_CONNECTIONS 256
#define CLIENT_BUFFER_SIZE (128 * 1024)

typedef struct {
    int fd;
    bool is_worker;
    uint8_t buffer[CLIENT_BUFFER_SIZE];
    size_t buffer_len;
} connection_t;

static volatile bool g_running = true;
static int g_listen_socket = -1;
static int g_worker_fd = -1;
static connection_t g_conns[MAX_CONNECTIONS];
static struct pollfd g_pollfds[MAX_CONNECTIONS + 1];
static int g_poll_count = 0;

static void handle_signal(int sig) {
    (void)sig;
    g_running = false;
}

static void remove_connection(int index) {
    if (index < 1 || index >= g_poll_count) {
        return;
    }

    int fd = g_pollfds[index].fd;
    if (fd == g_worker_fd) {
        printf("[GATEWAY] Java Worker disconnected (fd %d)\n", g_worker_fd);
        g_worker_fd = -1;
    } else {
        printf("[GATEWAY] Client disconnected (fd %d)\n", fd);
    }

    tcp_close(&fd);

    // Swap with the last connection in poll list
    int last_idx = g_poll_count - 1;
    if (index != last_idx) {
        g_pollfds[index] = g_pollfds[last_idx];
        g_conns[index - 1] = g_conns[last_idx - 1];
    }
    g_poll_count--;
}

static void forward_frame(int conn_idx, const uint8_t *frame_data,
                          size_t frame_len, const engine_header_t *header) {
    connection_t *conn = &g_conns[conn_idx - 1];

    if (header->msg_type == OP_SYS_HANDSHAKE) {
        for (int i = 1; i < g_poll_count; i++) {
            g_conns[i - 1].is_worker = false;
        }
        conn->is_worker = true;
        g_worker_fd = conn->fd;
        printf("[GATEWAY] Registered Java Worker on fd %d\n", g_worker_fd);
        return;
    }

    if (conn->is_worker) {
        // Response or Broadcast from Java Backend
        if (header->client_id == BROADCAST_CLIENT_ID) {
            // Broadcast to all clients (exclude worker & listen socket)
            for (int i = 1; i < g_poll_count; i++) {
                if (!g_conns[i - 1].is_worker) {
                    tcp_send_all(g_pollfds[i].fd, frame_data, frame_len);
                }
            }
        } else {
            // Unicast to target client_id
            int target_fd = (int)header->client_id;
            bool found = false;
            for (int i = 1; i < g_poll_count; i++) {
                if (g_pollfds[i].fd == target_fd && !g_conns[i - 1].is_worker) {
                    tcp_send_all(target_fd, frame_data, frame_len);
                    found = true;
                    break;
                }
            }
            if (!found) {
                printf("[GATEWAY] Client fd %d not found for response (seq: %u)\n",
                       target_fd, header->seq_id);
            }
        }
    } else {
        // Request from an Electron Client -> forward to Worker
        if (g_worker_fd == -1) {
            printf("[GATEWAY] Dropping request from fd %d: Worker offline\n", conn->fd);
            return;
        }

        // Stamp client_id = client socket fd
        engine_header_t stamped_header = *header;
        stamped_header.client_id = (uint32_t)conn->fd;

        // Encode stamped header
        uint8_t stamped_frame[ENGINE_HEADER_SIZE];
        engine_header_encode(&stamped_header, stamped_frame);

        // Send stamped header + original payload to Java Worker
        tcp_send_all(g_worker_fd, stamped_frame, ENGINE_HEADER_SIZE);
        if (stamped_header.payload_len > 0) {
            tcp_send_all(g_worker_fd, frame_data + ENGINE_HEADER_SIZE,
                         stamped_header.payload_len);
        }
    }
}

static void process_connection_buffer(int conn_idx) {
    connection_t *conn = &g_conns[conn_idx - 1];

    while (conn->buffer_len >= ENGINE_HEADER_SIZE) {
        engine_header_t header;
        if (engine_header_decode(conn->buffer, &header) != 0) {
            printf("[GATEWAY] Invalid magic/version on fd %d. Closing.\n", conn->fd);
            remove_connection(conn_idx);
            return;
        }

        if (header.payload_len > MAX_PAYLOAD_SIZE) {
            printf("[GATEWAY] Payload too large (%u B). Closing fd %d.\n",
                   header.payload_len, conn->fd);
            remove_connection(conn_idx);
            return;
        }

        size_t total_frame_len = ENGINE_HEADER_SIZE + header.payload_len;
        if (conn->buffer_len < total_frame_len) {
            // Incomplete frame, wait for more data
            break;
        }

        // Forward the complete frame
        forward_frame(conn_idx, conn->buffer, total_frame_len, &header);

        // Advance buffer (memmove handles remaining sticky bytes)
        size_t remaining = conn->buffer_len - total_frame_len;
        if (remaining > 0) {
            memmove(conn->buffer, conn->buffer + total_frame_len, remaining);
        }
        conn->buffer_len = remaining;
    }
}

int main(int argc, char *argv[]) {
    int port = DEFAULT_GATEWAY_PORT;
    if (argc > 1) {
        port = atoi(argv[1]);
        if (port <= 0 || port > 65535) {
            port = DEFAULT_GATEWAY_PORT;
        }
    }

    signal(SIGINT, handle_signal);
    signal(SIGTERM, handle_signal);
    signal(SIGPIPE, SIG_IGN);

    tcp_server_t server;
    if (tcp_server_init(&server, "0.0.0.0", port, 128) != 0) {
        fprintf(stderr, "[GATEWAY] Failed to initialize TCP server on port %d\n", port);
        return 1;
    }

    tcp_set_nonblocking(server.listen_socket);
    g_listen_socket = server.listen_socket;

    g_pollfds[0].fd = g_listen_socket;
    g_pollfds[0].events = POLLIN;
    g_poll_count = 1;

    printf("====================================================\n");
    printf("  mooc-clone C Communication Engine (TCP Gateway)   \n");
    printf("  Port: %d | Single-threaded Stateless Multiplexer \n", port);
    printf("====================================================\n");

    while (g_running) {
        int poll_res = poll(g_pollfds, g_poll_count, 1000);
        if (poll_res < 0) {
            if (errno == EINTR) {
                continue;
            }
            perror("[GATEWAY] poll error");
            break;
        }

        if (poll_res == 0) {
            continue;
        }

        // 1. Accept new incoming connections
        if (g_pollfds[0].revents & POLLIN) {
            while (true) {
                tcp_client_conn_t client_conn;
                if (tcp_server_accept_nonblocking(&server, &client_conn) != 0) {
                    break;
                }

                if (g_poll_count >= MAX_CONNECTIONS) {
                    printf("[GATEWAY] Connection pool full. Refusing client.\n");
                    close(client_conn.client_socket);
                    break;
                }

                int new_idx = g_poll_count;
                g_pollfds[new_idx].fd = client_conn.client_socket;
                g_pollfds[new_idx].events = POLLIN;
                g_pollfds[new_idx].revents = 0;

                g_conns[new_idx - 1].fd = client_conn.client_socket;
                g_conns[new_idx - 1].is_worker = false;
                g_conns[new_idx - 1].buffer_len = 0;

                g_poll_count++;
                printf("[GATEWAY] Accepted connection from %s:%d (fd %d)\n",
                       client_conn.client_ip, client_conn.client_port, client_conn.client_socket);
            }
        }

        // 2. Process data on client / worker connections
        for (int i = 1; i < g_poll_count; i++) {
            if (g_pollfds[i].revents & (POLLERR | POLLHUP | POLLNVAL)) {
                remove_connection(i);
                i--;
                continue;
            }

            if (g_pollfds[i].revents & POLLIN) {
                connection_t *conn = &g_conns[i - 1];
                size_t space_left = CLIENT_BUFFER_SIZE - conn->buffer_len;
                if (space_left == 0) {
                    printf("[GATEWAY] Buffer overflow on fd %d. Dropping connection.\n", conn->fd);
                    remove_connection(i);
                    i--;
                    continue;
                }

                ssize_t n = recv(conn->fd, conn->buffer + conn->buffer_len, space_left, 0);
                if (n <= 0) {
                    if (n < 0 && (errno == EAGAIN || errno == EWOULDBLOCK)) {
                        continue;
                    }
                    remove_connection(i);
                    i--;
                    continue;
                }

                conn->buffer_len += (size_t)n;
                process_connection_buffer(i);
            }
        }
    }

    printf("\n[GATEWAY] Shutting down...\n");
    for (int i = 1; i < g_poll_count; i++) {
        close(g_pollfds[i].fd);
    }
    tcp_server_close(&server);
    printf("[GATEWAY] Stopped cleanly.\n");

    return 0;
}
