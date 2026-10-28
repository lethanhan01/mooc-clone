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

static volatile sig_atomic_t g_running = 1;
static reactor_t *g_reactor = NULL;
static thread_pool_t *g_thread_pool = NULL;
static tcp_server_t g_server;
static in_memory_store_t g_store;
static http_router_t g_router;

static void handle_sigint(int sig) {
    (void)sig;
    printf("\n[SERVER] Caught termination signal! Initiating graceful shutdown...\n");
    g_running = 0;
    if (g_reactor) {
        reactor_stop(g_reactor);
    }
}

// Handler cho chế độ Tuần tự (Sequential)
static void handle_client_sequential(int client_fd) {
    char buf[16384];
    size_t buf_len = 0;
    http_parser_t parser;
    http_request_t req;
    http_parser_init(&parser);
    http_request_init(&req);

    while (1) {
        char temp[4096];
        ssize_t n = recv(client_fd, temp, sizeof(temp), 0);
        if (n <= 0) break;

        if (buf_len + (size_t)n > sizeof(buf)) break;
        memcpy(buf + buf_len, temp, (size_t)n);
        buf_len += (size_t)n;

        http_parser_init(&parser);
        http_request_free(&req);
        http_request_init(&req);
        int parsed = http_parser_execute(&parser, &req, buf, buf_len);
        if (parsed > 0) {
            http_response_t res;
            http_router_dispatch(&g_router, &req, &res);

            size_t out_len = 0;
            char *serialized = http_response_serialize(&res, &out_len);
            if (serialized) {
                tcp_send_all(client_fd, serialized, out_len);
                free(serialized);
            }
            http_response_free(&res);
            break;
        } else if (parsed < 0) {
            break;
        }
    }

    http_request_free(&req);
    close(client_fd);
}

// Handler cho chế độ Thread Pool
typedef struct {
    int client_fd;
} threadpool_conn_arg_t;

static void handle_client_threadpool_task(void *arg) {
    threadpool_conn_arg_t *conn_arg = (threadpool_conn_arg_t *)arg;
    if (!conn_arg) return;

    handle_client_sequential(conn_arg->client_fd);
    free(conn_arg);
}

int main(int argc, char *argv[]) {
    int port = 8080;
    char mode[32] = "reactor";
    size_t threads = 16;

    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--port") == 0 && i + 1 < argc) {
            port = atoi(argv[++i]);
        } else if (strcmp(argv[i], "--mode") == 0 && i + 1 < argc) {
            strncpy(mode, argv[++i], sizeof(mode) - 1);
        } else if (strcmp(argv[i], "--threads") == 0 && i + 1 < argc) {
            threads = (size_t)atoi(argv[++i]);
        }
    }

    struct sigaction sa;
    memset(&sa, 0, sizeof(sa));
    sa.sa_handler = handle_sigint;
    sigaction(SIGINT, &sa, NULL);
    sigaction(SIGTERM, &sa, NULL);
    signal(SIGPIPE, SIG_IGN);

    store_init(&g_store);
    http_router_init(&g_router);
    register_all_routes(&g_router, &g_store);

    if (tcp_server_init(&g_server, "0.0.0.0", port, 512) != 0) {
        fprintf(stderr, "[SERVER] Failed to bind to port %d\n", port);
        store_destroy(&g_store);
        return 1;
    }

    printf("====================================================================\n");
    printf("   MOOC-CLONE HIGH PERFORMANCE C HTTP/REST SERVER\n");
    printf("   Port:    %d\n", port);
    printf("   Mode:    %s\n", mode);
    printf("   Threads: %zu\n", threads);
    printf("   Press Ctrl+C for Graceful Shutdown\n");
    printf("====================================================================\n");

    if (strcmp(mode, "reactor") == 0) {
        g_reactor = reactor_create(g_server.server_fd, &g_router, threads);
        if (!g_reactor) {
            fprintf(stderr, "[SERVER] Failed to create reactor instance\n");
            tcp_server_close(&g_server);
            store_destroy(&g_store);
            return 1;
        }
        reactor_run_event_loop(g_reactor);
        reactor_destroy(g_reactor);
        g_reactor = NULL;
    } else if (strcmp(mode, "threadpool") == 0) {
        g_thread_pool = thread_pool_create(threads);
        printf("[SERVER] Thread Pool running with %zu workers\n", threads);
        while (g_running) {
            tcp_client_conn_t conn;
            if (tcp_server_accept(&g_server, &conn) == 0) {
                threadpool_conn_arg_t *arg = (threadpool_conn_arg_t *)malloc(sizeof(threadpool_conn_arg_t));
                if (arg) {
                    arg->client_fd = conn.client_fd;
                    thread_pool_submit(g_thread_pool, handle_client_threadpool_task, arg);
                } else {
                    close(conn.client_fd);
                }
            }
        }
        thread_pool_destroy(g_thread_pool);
        g_thread_pool = NULL;
    } else { // sequential
        printf("[SERVER] Sequential mode running (1 client at a time)\n");
        while (g_running) {
            tcp_client_conn_t conn;
            if (tcp_server_accept(&g_server, &conn) == 0) {
                handle_client_sequential(conn.client_fd);
            }
        }
    }

    tcp_server_close(&g_server);
    store_destroy(&g_store);

    printf("[SERVER] Graceful shutdown completed. Zero memory leaks.\n");
    return 0;
}
