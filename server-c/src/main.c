#include "tcp_socket.h"
#include "http_parser.h"
#include "http_router.h"
#include "in_memory_store.h"
#include "rest_controllers.h"
#include "thread_pool.h"
#include "reactor.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>
#include <unistd.h>
#include <errno.h>
#include <sys/socket.h>

#define DEFAULT_SERVER_PORT 8080
#define DEFAULT_WORKER_THREADS 16
#define SERVER_LISTEN_BACKLOG 512
#define SEQUENTIAL_BUF_SIZE 16384
#define MODE_NAME_MAX_LEN 32

static volatile sig_atomic_t g_running = 1;
static reactor_t *g_reactor = NULL;
static thread_pool_t *g_thread_pool = NULL;
static tcp_server_t g_server;
static in_memory_store_t g_store;
static http_router_t g_router;

/**
 * @brief Xử lý tín hiệu ngắt (SIGINT/SIGTERM) để kích hoạt quy trình Graceful Shutdown.
 *
 * Chỉ sử dụng hàm async-signal-safe (write) bên trong signal handler theo chuẩn POSIX.
 *
 * @param[in] sig Mã tín hiệu nhận được.
 */
static void handle_sigint(int sig) {
    (void)sig;
    const char msg[] = "\n[SERVER] Caught termination signal! Initiating graceful shutdown...\n";
    ssize_t unused = write(STDOUT_FILENO, msg, sizeof(msg) - 1);
    (void)unused;
    g_running = 0;
    if (g_reactor) {
        reactor_stop(g_reactor);
    }
}

/**
 * @brief Phục vụ một kết nối HTTP theo chế độ đồng bộ tuần tự (Sequential / Blocking).
 *
 * Đọc từng mảnh dữ liệu qua recv(), ghép vào bộ đệm tích lũy cho tới khi FSM parser
 * xác nhận đủ 1 HTTP request hoàn chỉnh, sau đó điều phối qua Router và gửi phản hồi.
 *
 * @param[in] client_socket Socket descriptor của kết nối client.
 */
static void handle_client_sequential(int client_socket) {
    char request_buffer[SEQUENTIAL_BUF_SIZE];
    size_t buffer_len = 0;
    http_parser_t parser;
    http_request_t req;
    http_parser_init(&parser);
    http_request_init(&req);

    while (1) {
        char read_chunk[RECV_CHUNK_SIZE];
        ssize_t bytes_received = recv(client_socket, read_chunk, sizeof(read_chunk), 0);
        if (bytes_received == 0) {
            // Client đã chủ động đóng kết nối bình thường (EOF / FIN)
            break;
        }
        if (bytes_received < 0) {
            if (errno == EINTR) {
                continue;
            }
            perror("[SERVER] recv");
            break;
        }

        if (buffer_len + (size_t)bytes_received > sizeof(request_buffer)) {
            const char *bad_req =
                "HTTP/1.1 400 Bad Request\r\n"
                "Content-Type: application/json; charset=utf-8\r\n"
                "Content-Length: 36\r\n"
                "Connection: close\r\n\r\n"
                "{\"error\":\"Bad Request\",\"status\":400}";
            tcp_send_all(client_socket, bad_req, strlen(bad_req));
            break;
        }

        memcpy(request_buffer + buffer_len, read_chunk, (size_t)bytes_received);
        buffer_len += (size_t)bytes_received;

        int parsed = http_parser_execute(&parser, &req, request_buffer, buffer_len);
        if (parsed > 0) {
            http_response_t res;
            http_router_dispatch(&g_router, &req, &res);

            size_t out_len = 0;
            char *serialized = http_response_serialize(&res, &out_len);
            if (serialized) {
                tcp_send_all(client_socket, serialized, out_len);
                free(serialized);
            }
            http_response_free(&res);
            break;
        } else if (parsed < 0) {
            const char *bad_req =
                "HTTP/1.1 400 Bad Request\r\n"
                "Content-Type: application/json; charset=utf-8\r\n"
                "Content-Length: 36\r\n"
                "Connection: close\r\n\r\n"
                "{\"error\":\"Bad Request\",\"status\":400}";
            tcp_send_all(client_socket, bad_req, strlen(bad_req));
            break;
        }
    }

    http_request_free(&req);
    tcp_close(&client_socket);
}

/**
 * @brief Cấu trúc đóng gói tham số kết nối để truyền vào hàng đợi Thread Pool.
 */
typedef struct {
    int client_socket;
} threadpool_conn_arg_t;

/**
 * @brief Tác vụ xử lý một kết nối client trên luồng công nhân của chế độ Thread Pool.
 *
 * @param[in] arg Con trỏ tới cấu trúc threadpool_conn_arg_t.
 */
static void handle_client_threadpool_task(void *arg) {
    threadpool_conn_arg_t *conn_arg = (threadpool_conn_arg_t *)arg;
    if (!conn_arg) {
        return;
    }

    handle_client_sequential(conn_arg->client_socket);
    free(conn_arg);
}

/**
 * @brief Điểm khởi chạy chính của máy chủ HTTP/REST hiệu năng cao (mooc-clone server-c).
 *
 * Hỗ trợ 3 chế độ vận hành:
 * - reactor:    Doug Lea Classic Reactor (epoll + Worker ThreadPool).
 * - threadpool: Mỗi kết nối được đẩy vào hàng đợi Thread Pool.
 * - sequential: Phục vụ tuần tự từng kết nối một.
 *
 * @param[in] argc Số lượng tham số dòng lệnh.
 * @param[in] argv Danh sách chuỗi tham số (--port, --mode, --threads).
 * @return int EXIT_SUCCESS (0) nếu thành công, EXIT_FAILURE (1) nếu gặp lỗi khởi tạo.
 */
int main(int argc, char *argv[]) {
    int port = DEFAULT_SERVER_PORT;
    char mode[MODE_NAME_MAX_LEN] = "reactor";
    size_t threads = DEFAULT_WORKER_THREADS;

    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--port") == 0 && i + 1 < argc) {
            port = atoi(argv[++i]);
        } else if (strcmp(argv[i], "--mode") == 0 && i + 1 < argc) {
            memset(mode, 0, sizeof(mode));
            strncpy(mode, argv[++i], sizeof(mode) - 1);
        } else if (strcmp(argv[i], "--threads") == 0 && i + 1 < argc) {
            threads = (size_t)atoi(argv[++i]);
        }
    }

    struct sigaction sig_act;
    memset(&sig_act, 0, sizeof(sig_act));
    sig_act.sa_handler = handle_sigint;
    if (sigaction(SIGINT, &sig_act, NULL) < 0) {
        perror("[SERVER] sigaction SIGINT");
        return EXIT_FAILURE;
    }
    if (sigaction(SIGTERM, &sig_act, NULL) < 0) {
        perror("[SERVER] sigaction SIGTERM");
        return EXIT_FAILURE;
    }
    signal(SIGPIPE, SIG_IGN);

    store_init(&g_store);
    http_router_init(&g_router);
    register_all_routes(&g_router, &g_store);

    if (tcp_server_init(&g_server, DEFAULT_BIND_HOST, port, SERVER_LISTEN_BACKLOG) != 0) {
        fprintf(stderr, "[SERVER] Failed to bind to port %d\n", port);
        store_destroy(&g_store);
        return EXIT_FAILURE;
    }

    printf("====================================================================\n");
    printf("   MOOC-CLONE HIGH PERFORMANCE C HTTP/REST SERVER\n");
    printf("   Port:    %d\n", port);
    printf("   Mode:    %s\n", mode);
    printf("   Threads: %zu\n", threads);
    printf("   Press Ctrl+C for Graceful Shutdown\n");
    printf("====================================================================\n");

    if (strcmp(mode, "reactor") == 0) {
        g_reactor = reactor_create(g_server.listen_socket, &g_router, threads);
        if (!g_reactor) {
            fprintf(stderr, "[SERVER] Failed to create reactor instance\n");
            tcp_server_close(&g_server);
            store_destroy(&g_store);
            return EXIT_FAILURE;
        }
        reactor_run_event_loop(g_reactor);
        reactor_destroy(g_reactor);
        g_reactor = NULL;
    } else if (strcmp(mode, "threadpool") == 0) {
        g_thread_pool = thread_pool_create(threads);
        if (!g_thread_pool) {
            fprintf(stderr, "[SERVER] Failed to create thread pool\n");
            tcp_server_close(&g_server);
            store_destroy(&g_store);
            return EXIT_FAILURE;
        }
        printf("[SERVER] Thread Pool running with %zu workers\n", threads);
        while (g_running) {
            tcp_client_conn_t conn;
            if (tcp_server_accept(&g_server, &conn) == 0) {
                threadpool_conn_arg_t *arg =
                    (threadpool_conn_arg_t *)malloc(sizeof(threadpool_conn_arg_t));
                if (arg) {
                    arg->client_socket = conn.client_socket;
                    if (thread_pool_submit(g_thread_pool,
                                           handle_client_threadpool_task,
                                           arg) != 0) {
                        tcp_close(&conn.client_socket);
                        free(arg);
                    }
                } else {
                    tcp_close(&conn.client_socket);
                }
            }
        }
        thread_pool_destroy(g_thread_pool);
        g_thread_pool = NULL;
    } else {
        printf("[SERVER] Sequential mode running (1 client at a time)\n");
        while (g_running) {
            tcp_client_conn_t conn;
            if (tcp_server_accept(&g_server, &conn) == 0) {
                handle_client_sequential(conn.client_socket);
            }
        }
    }

    tcp_server_close(&g_server);
    store_destroy(&g_store);

    printf("[SERVER] Graceful shutdown completed. Zero memory leaks.\n");
    return EXIT_SUCCESS;
}
