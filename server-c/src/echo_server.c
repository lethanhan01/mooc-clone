#include "tcp_socket.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>
#include <unistd.h>

static volatile sig_atomic_t g_running = 1;

static void handle_sigint(int sig) {
    (void)sig;
    g_running = 0;
}

int main(int argc, char *argv[]) {
    int port = 8080;
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--port") == 0 && i + 1 < argc) {
            port = atoi(argv[++i]);
        }
    }

    struct sigaction sa;
    memset(&sa, 0, sizeof(sa));
    sa.sa_handler = handle_sigint;
    sigaction(SIGINT, &sa, NULL);
    sigaction(SIGTERM, &sa, NULL);
    signal(SIGPIPE, SIG_IGN);

    tcp_server_t server;
    if (tcp_server_init(&server, "0.0.0.0", port, 64) != 0) {
        fprintf(stderr, "Failed to initialize TCP Echo Server on port %d\n", port);
        return 1;
    }

    printf("[ECHO SERVER] Running on port %d (Press Ctrl+C to stop)\n", port);

    while (g_running) {
        tcp_client_conn_t conn;
        if (tcp_server_accept(&server, &conn) == 0) {
            printf("[ECHO SERVER] Accepted connection from %s:%d\n", conn.client_ip, conn.client_port);
            char buffer[2048];
            ssize_t bytes_read;
            while ((bytes_read = tcp_recv(conn.client_fd, buffer, sizeof(buffer))) > 0) {
                if (tcp_send_all(conn.client_fd, buffer, (size_t)bytes_read) < 0) {
                    break;
                }
            }
            printf("[ECHO SERVER] Closed connection from %s:%d\n", conn.client_ip, conn.client_port);
            tcp_close(&conn.client_fd);
        }
    }

    printf("[ECHO SERVER] Shutting down...\n");
    tcp_server_close(&server);
    return 0;
}
