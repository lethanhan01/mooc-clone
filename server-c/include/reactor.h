#ifndef REACTOR_H
#define REACTOR_H

#include <stdbool.h>
#include <pthread.h>
#include <sys/epoll.h>
#include <time.h>
#include "http_parser.h"
#include "http_router.h"
#include "thread_pool.h"

#define MAX_EPOLL_EVENTS 1024
#define ACCUMULATION_BUF_SIZE 32768
#define RECV_CHUNK_SIZE 4096
#define EPOLL_WAIT_TIMEOUT_MS 500

/**
 * @brief Cấu trúc đại diện cho một phiên kết nối HTTP/1.1 Keep-Alive của Client.
 *
 * Mỗi phiên sở hữu bộ đệm tích lũy (accumulation_buffer) và bộ phân tích FSM riêng biệt
 * để xử lý bất đồng bộ các gói tin bị phân mảnh hoặc dính liền trên non-blocking socket.
 */
typedef struct client_session {
    int client_socket;
    char accumulation_buffer[ACCUMULATION_BUF_SIZE];
    size_t buffer_len;
    http_parser_t parser;
    http_request_t current_request;
    time_t last_active;
    struct client_session *prev;
    struct client_session *next;
} client_session_t;

/**
 * @brief Cấu trúc điều phối trung tâm theo mô hình Doug Lea Classic Reactor Pattern.
 *
 * Bao gồm 1 luồng Event Loop duy nhất chạy epoll_wait() để dồn kênh I/O và chuyển giao
 * các khung tin HTTP hoàn chỉnh sang Worker ThreadPool xử lý nghiệp vụ.
 */
typedef struct {
    int epoll_fd;
    int listen_socket;
    volatile bool is_running;
    thread_pool_t *worker_pool;
    http_router_t *router;
    pthread_mutex_t sessions_lock;
    client_session_t *sessions_head;
} reactor_t;

/**
 * @brief Khởi tạo thực thể Reactor, đăng ký listen_socket vào epoll và tạo Worker Pool.
 *
 * @param[in] listen_socket  Socket descriptor đang lắng nghe kết nối TCP.
 * @param[in] router         Con trỏ tới bộ định tuyến HTTP đã đăng ký các endpoints.
 * @param[in] worker_threads Số lượng luồng công nhân trong Thread Pool.
 * @return reactor_t* Con trỏ tới thực thể Reactor, hoặc NULL nếu có lỗi hệ thống.
 */
reactor_t *reactor_create(int listen_socket, http_router_t *router, size_t worker_threads);

/**
 * @brief Khởi chạy vòng lặp sự kiện chính (Single-threaded I/O Demultiplexer Event Loop).
 *
 * Hàm này sẽ chặn (block) luồng gọi cho tới khi reactor_stop() được kích hoạt.
 *
 * @param[in,out] reactor Con trỏ tới thực thể Reactor.
 */
void reactor_run_event_loop(reactor_t *reactor);

/**
 * @brief Ra hiệu cho vòng lặp sự kiện epoll dừng lại một cách an toàn (Graceful Stop).
 *
 * @param[in,out] reactor Con trỏ tới thực thể Reactor.
 */
void reactor_stop(reactor_t *reactor);

/**
 * @brief Hủy Reactor, chờ Worker Pool hoàn tất, đóng toàn bộ phiên Keep-Alive và epoll_fd.
 *
 * @param[in,out] reactor Con trỏ tới thực thể Reactor cần giải phóng.
 */
void reactor_destroy(reactor_t *reactor);

#endif // REACTOR_H
