#include "tcp_socket.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>
#include <unistd.h>

#define DEFAULT_ECHO_PORT 8080
#define ECHO_LISTEN_BACKLOG 64
#define ECHO_BUFFER_SIZE 2048

static volatile sig_atomic_t g_running = 1;

/**
 * @brief Bắt tín hiệu ngắt hệ thống (SIGINT/SIGTERM) để thoát vòng lặp accept() an toàn.
 *
 * @param[in] sig Mã tín hiệu hệ thống nhận được.
 */
static void handle_sigint(int sig) {
    (void)sig;
    g_running = 0;
}

/**
 * @brief Điểm khởi đầu của TCP Echo Server (Giai đoạn 1).
 *
 * Minh họa chu trình lập trình Socket TCP tuần tự chuẩn:
 * socket() -> setsockopt() -> bind() -> listen() -> accept() -> recv()/send() -> close().
 *
 * @param[in] argc Số lượng tham số dòng lệnh.
 * @param[in] argv Mảng chuỗi tham số dòng lệnh (hỗ trợ --port <port>).
 * @return int EXIT_SUCCESS (0) nếu thoát bình thường, EXIT_FAILURE (1) nếu lỗi khởi tạo.
 */
int main(int argc, char *argv[]) {
    int port = DEFAULT_ECHO_PORT;
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--port") == 0 && i + 1 < argc) {
            port = atoi(argv[++i]);
        }
    }

    struct sigaction sig_act;
    memset(&sig_act, 0, sizeof(sig_act));
    sig_act.sa_handler = handle_sigint;
    if (sigaction(SIGINT, &sig_act, NULL) < 0) {
        perror("[ECHO SERVER] sigaction SIGINT");
        return EXIT_FAILURE;
    }
    if (sigaction(SIGTERM, &sig_act, NULL) < 0) {
        perror("[ECHO SERVER] sigaction SIGTERM");
        return EXIT_FAILURE;
    }
    // Bỏ qua SIGPIPE để tiến trình không bị nhân Linux kết thúc đột ngột khi ghi vào socket đã đóng
    signal(SIGPIPE, SIG_IGN);

    tcp_server_t server;
    if (tcp_server_init(&server, DEFAULT_BIND_HOST, port, ECHO_LISTEN_BACKLOG) != 0) {
        fprintf(stderr, "Failed to initialize TCP Echo Server on port %d\n", port);
        return EXIT_FAILURE;
    }

    printf("[ECHO SERVER] Running on port %d (Press Ctrl+C to stop)\n", port);

    while (g_running) {
        tcp_client_conn_t conn;
        if (tcp_server_accept(&server, &conn) == 0) {
            printf("[ECHO SERVER] Accepted connection from %s:%d\n",
                   conn.client_ip, conn.client_port);

            char buffer[ECHO_BUFFER_SIZE];
            ssize_t bytes_received;

            // Đọc liên tục dòng byte từ client và phản hồi lại nguyên vẹn qua tcp_send_all()
            // cho đến khi client chủ động đóng kết nối (tcp_recv trả về 0 - EOF).
            while ((bytes_received = tcp_recv(conn.client_socket, buffer, sizeof(buffer))) > 0) {
                if (tcp_send_all(conn.client_socket, buffer, (size_t)bytes_received) < 0) {
                    break;
                }
            }

            printf("[ECHO SERVER] Closed connection from %s:%d\n",
                   conn.client_ip, conn.client_port);
            tcp_close(&conn.client_socket);
        }
    }

    printf("[ECHO SERVER] Shutting down...\n");
    tcp_server_close(&server);
    return EXIT_SUCCESS;
}
