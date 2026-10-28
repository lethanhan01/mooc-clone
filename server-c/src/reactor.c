#include "reactor.h"
#include "tcp_socket.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <sys/socket.h>

/**
 * @brief Cấu trúc gói công việc bàn giao từ Reactor Event Loop sang Worker ThreadPool.
 */
typedef struct {
    reactor_t *reactor;
    client_session_t *session;
    http_request_t req;
} worker_job_t;

/**
 * @brief Gửi phản hồi lỗi cố định HTTP 400 Bad Request khi gói tin vi phạm cú pháp HTTP.
 *
 * @param[in] client_socket Socket descriptor của client gửi gói tin lỗi.
 */
static void send_bad_request(int client_socket) {
    if (client_socket < 0) {
        return;
    }
    const char *bad_req_resp =
        "HTTP/1.1 400 Bad Request\r\n"
        "Content-Type: application/json; charset=utf-8\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "Content-Length: 36\r\n"
        "Connection: close\r\n"
        "\r\n"
        "{\"error\":\"Bad Request\",\"status\":400}";
    tcp_send_all(client_socket, bad_req_resp, strlen(bad_req_resp));
}

/**
 * @brief Thêm phiên kết nối mới vào danh sách liên kết đôi quản lý bởi Reactor.
 *
 * Việc theo dõi mọi phiên đang mở giúp reactor_destroy() giải phóng 100% tài nguyên
 * ngay cả với các kết nối Keep-Alive đang rảnh khi tắt máy chủ.
 *
 * @param[in,out] reactor Con trỏ tới thực thể Reactor.
 * @param[in,out] session Con trỏ tới phiên kết nối client vừa khởi tạo.
 */
static void register_client_session(reactor_t *reactor, client_session_t *session) {
    if (!reactor || !session) {
        return;
    }
    pthread_mutex_lock(&reactor->sessions_lock);
    session->prev = NULL;
    session->next = reactor->sessions_head;
    if (reactor->sessions_head) {
        reactor->sessions_head->prev = session;
    }
    reactor->sessions_head = session;
    pthread_mutex_unlock(&reactor->sessions_lock);
}

/**
 * @brief Gỡ phiên kết nối khỏi danh sách quản lý, xóa khỏi epoll, đóng socket và giải phóng.
 *
 * @param[in,out] reactor Con trỏ tới thực thể Reactor.
 * @param[in,out] session Con trỏ tới phiên kết nối cần đóng và hủy.
 */
static void close_client_session(reactor_t *reactor, client_session_t *session) {
    if (!reactor || !session) {
        return;
    }

    pthread_mutex_lock(&reactor->sessions_lock);
    if (session->prev) {
        session->prev->next = session->next;
    } else if (reactor->sessions_head == session) {
        reactor->sessions_head = session->next;
    }
    if (session->next) {
        session->next->prev = session->prev;
    }
    session->prev = NULL;
    session->next = NULL;
    pthread_mutex_unlock(&reactor->sessions_lock);

    if (session->client_socket >= 0) {
        if (reactor->epoll_fd >= 0) {
            if (epoll_ctl(reactor->epoll_fd,
                          EPOLL_CTL_DEL,
                          session->client_socket,
                          NULL) < 0) {
                if (errno != ENOENT && errno != EBADF) {
                    perror("[REACTOR] epoll_ctl EPOLL_CTL_DEL");
                }
            }
        }
        tcp_close(&session->client_socket);
    }
    http_request_free(&session->current_request);
    free(session);
}

/**
 * @brief Điều phối HTTP request qua Router, đóng gói phản hồi và gửi qua socket.
 *
 * @param[in]     reactor Con trỏ tới thực thể Reactor.
 * @param[in]     session Con trỏ tới phiên kết nối của client.
 * @param[in,out] req     Con trỏ tới HTTP request cần xử lý (sẽ được giải phóng sau khi gửi).
 * @return bool true nếu kết nối tiếp tục duy trì Keep-Alive, false nếu cần đóng kết nối.
 */
static bool dispatch_and_send_response(reactor_t *reactor,
                                       client_session_t *session,
                                       http_request_t *req) {
    http_response_t res;
    http_router_dispatch(reactor->router, req, &res);

    if (req->keep_alive) {
        http_response_add_header(&res, "Connection", "keep-alive");
    } else {
        http_response_add_header(&res, "Connection", "close");
    }

    size_t out_len = 0;
    char *serialized = http_response_serialize(&res, &out_len);
    bool send_ok = false;
    if (serialized) {
        if (tcp_send_all(session->client_socket, serialized, out_len) == (ssize_t)out_len) {
            send_ok = true;
        }
        free(serialized);
    }
    http_response_free(&res);

    bool keep_alive = req->keep_alive && send_ok;
    http_request_free(req);
    return keep_alive;
}

/**
 * @brief Hàm thực thi trên Worker Thread để xử lý HTTP request và rút cạn các gói Pipelined.
 *
 * Do socket được đăng ký cờ EPOLLET | EPOLLONESHOT, nếu một lần recv() đọc được nhiều
 * HTTP request dính liền nhau (Sticky Packets / Pipelining), nhân Linux sẽ không phát lại
 * sự kiện EPOLLIN cho phần dữ liệu đã nằm sẵn trong accumulation_buffer. Vì vậy, Worker
 * phải rút cạn tuần tự (Sequential Per-Session Drain) toàn bộ các request hoàn chỉnh
 * trước khi kích hoạt lại (re-arm) EPOLLONESHOT.
 *
 * @param[in] arg Con trỏ tới cấu trúc worker_job_t.
 */
static void worker_execute_job(void *arg) {
    worker_job_t *job = (worker_job_t *)arg;
    if (!job) {
        return;
    }

    reactor_t *reactor = job->reactor;
    client_session_t *session = job->session;

    // 1. Xử lý request đầu tiên đã được bóc tách từ luồng I/O
    bool keep_alive = dispatch_and_send_response(reactor, session, &job->req);
    free(job);

    if (!keep_alive || session->client_socket < 0) {
        close_client_session(reactor, session);
        return;
    }

    // 2. Rút cạn tuần tự toàn bộ các gói tin Pipelined còn nằm trong accumulation_buffer
    while (session->buffer_len > 0) {
        int parsed = http_parser_execute(&session->parser,
                                         &session->current_request,
                                         session->accumulation_buffer,
                                         session->buffer_len);
        if (parsed > 0) {
            http_request_t next_req = session->current_request;
            size_t consumed = (size_t)parsed;
            memmove(session->accumulation_buffer,
                    session->accumulation_buffer + consumed,
                    session->buffer_len - consumed);
            session->buffer_len -= consumed;

            http_parser_init(&session->parser);
            http_request_init(&session->current_request);

            keep_alive = dispatch_and_send_response(reactor, session, &next_req);
            if (!keep_alive || session->client_socket < 0) {
                close_client_session(reactor, session);
                return;
            }
        } else if (parsed == 0) {
            // Dữ liệu còn dư là một request chưa hoàn chỉnh (Fragmented) -> chờ epoll lần tới
            break;
        } else {
            // Gói tin pipelined bị lỗi cú pháp -> trả về 400 Bad Request và đóng phiên
            send_bad_request(session->client_socket);
            close_client_session(reactor, session);
            return;
        }
    }

    // 3. Kích hoạt lại (re-arm) sự kiện EPOLLONESHOT cho kết nối Keep-Alive
    if (session->client_socket >= 0 && reactor->is_running) {
        struct epoll_event ev;
        memset(&ev, 0, sizeof(ev));
        ev.events = EPOLLIN | EPOLLET | EPOLLRDHUP | EPOLLONESHOT;
        ev.data.ptr = session;
        if (epoll_ctl(reactor->epoll_fd, EPOLL_CTL_MOD, session->client_socket, &ev) < 0) {
            perror("[REACTOR] epoll_ctl EPOLL_CTL_MOD");
            close_client_session(reactor, session);
        }
    } else {
        close_client_session(reactor, session);
    }
}

/**
 * @brief Đọc dữ liệu non-blocking từ client socket và bóc tách khung tin HTTP qua FSM.
 *
 * @param[in,out] reactor Con trỏ tới thực thể Reactor.
 * @param[in,out] session Con trỏ tới phiên kết nối phát sinh sự kiện EPOLLIN.
 */
static void handle_client_io(reactor_t *reactor, client_session_t *session) {
    while (1) {
        char read_chunk[RECV_CHUNK_SIZE];
        ssize_t bytes_received = recv(session->client_socket,
                                      read_chunk,
                                      sizeof(read_chunk),
                                      0);
        if (bytes_received > 0) {
            session->last_active = time(NULL);
            if (session->buffer_len + (size_t)bytes_received > ACCUMULATION_BUF_SIZE) {
                // Bảo vệ chống tràn bộ đệm tích lũy -> từ chối với 400 Bad Request
                send_bad_request(session->client_socket);
                close_client_session(reactor, session);
                return;
            }

            memcpy(session->accumulation_buffer + session->buffer_len,
                   read_chunk,
                   (size_t)bytes_received);
            session->buffer_len += (size_t)bytes_received;

            int parsed = http_parser_execute(&session->parser,
                                             &session->current_request,
                                             session->accumulation_buffer,
                                             session->buffer_len);
            if (parsed > 0) {
                // Đã bóc tách đủ 1 HTTP request hoàn chỉnh -> đẩy sang Worker ThreadPool
                worker_job_t *job = (worker_job_t *)malloc(sizeof(worker_job_t));
                if (!job) {
                    close_client_session(reactor, session);
                    return;
                }
                job->reactor = reactor;
                job->session = session;
                job->req = session->current_request;

                size_t consumed = (size_t)parsed;
                memmove(session->accumulation_buffer,
                        session->accumulation_buffer + consumed,
                        session->buffer_len - consumed);
                session->buffer_len -= consumed;

                http_parser_init(&session->parser);
                http_request_init(&session->current_request);

                if (thread_pool_submit(reactor->worker_pool, worker_execute_job, job) != 0) {
                    http_request_free(&job->req);
                    free(job);
                    close_client_session(reactor, session);
                }
                return;
            } else if (parsed < 0) {
                send_bad_request(session->client_socket);
                close_client_session(reactor, session);
                return;
            }
            // Khi parsed == 0 (gói tin bị phân mảnh chưa đủ byte), tiếp tục vòng lặp recv()
        } else if (bytes_received < 0) {
            if (errno == EAGAIN || errno == EWOULDBLOCK) {
                // Đã đọc cạn bộ đệm kernel (Edge-Triggered) nhưng chưa đủ 1 HTTP request.
                // Cần re-arm EPOLLONESHOT để chờ đợt dữ liệu tiếp theo từ client.
                struct epoll_event ev;
                memset(&ev, 0, sizeof(ev));
                ev.events = EPOLLIN | EPOLLET | EPOLLRDHUP | EPOLLONESHOT;
                ev.data.ptr = session;
                if (epoll_ctl(reactor->epoll_fd,
                              EPOLL_CTL_MOD,
                              session->client_socket,
                              &ev) < 0) {
                    perror("[REACTOR] epoll_ctl EPOLL_CTL_MOD");
                    close_client_session(reactor, session);
                }
                break;
            } else if (errno == EINTR) {
                continue;
            } else {
                perror("[REACTOR] recv");
                close_client_session(reactor, session);
                break;
            }
        } else {
            // recv() trả về 0: Client đã chủ động đóng kết nối bình thường (EOF / FIN)
            close_client_session(reactor, session);
            break;
        }
    }
}

reactor_t *reactor_create(int listen_socket, http_router_t *router, size_t worker_threads) {
    if (listen_socket < 0 || !router) {
        return NULL;
    }

    if (tcp_set_nonblocking(listen_socket) < 0) {
        return NULL;
    }

    int epoll_fd = epoll_create1(0);
    if (epoll_fd < 0) {
        perror("[REACTOR] epoll_create1");
        return NULL;
    }

    struct epoll_event ev;
    memset(&ev, 0, sizeof(ev));
    ev.events = EPOLLIN | EPOLLET;
    ev.data.fd = listen_socket;

    if (epoll_ctl(epoll_fd, EPOLL_CTL_ADD, listen_socket, &ev) < 0) {
        perror("[REACTOR] epoll_ctl EPOLL_CTL_ADD listen_socket");
        if (close(epoll_fd) < 0) {
            perror("[REACTOR] close epoll_fd");
        }
        return NULL;
    }

    reactor_t *reactor = (reactor_t *)calloc(1, sizeof(reactor_t));
    if (!reactor) {
        if (close(epoll_fd) < 0) {
            perror("[REACTOR] close epoll_fd");
        }
        return NULL;
    }

    reactor->epoll_fd = epoll_fd;
    reactor->listen_socket = listen_socket;
    reactor->router = router;
    reactor->is_running = false;
    reactor->sessions_head = NULL;
    pthread_mutex_init(&reactor->sessions_lock, NULL);

    reactor->worker_pool = thread_pool_create(worker_threads);
    if (!reactor->worker_pool) {
        pthread_mutex_destroy(&reactor->sessions_lock);
        if (close(epoll_fd) < 0) {
            perror("[REACTOR] close epoll_fd");
        }
        free(reactor);
        return NULL;
    }

    return reactor;
}

void reactor_run_event_loop(reactor_t *reactor) {
    if (!reactor) {
        return;
    }
    reactor->is_running = true;
    struct epoll_event events[MAX_EPOLL_EVENTS];

    printf("[REACTOR] Event Loop started with epoll (Single-thread Demux + Worker Pool)\n");

    while (reactor->is_running) {
        int ready_count = epoll_wait(reactor->epoll_fd,
                                     events,
                                     MAX_EPOLL_EVENTS,
                                     EPOLL_WAIT_TIMEOUT_MS);
        if (ready_count < 0) {
            if (errno == EINTR) {
                continue;
            }
            perror("[REACTOR] epoll_wait");
            break;
        }

        for (int i = 0; i < ready_count; i++) {
            if (events[i].data.fd == reactor->listen_socket) {
                // Sự kiện Acceptor: lặp accept4() tới khi nhận hết kết nối chờ (EAGAIN)
                while (1) {
                    tcp_client_conn_t conn;
                    tcp_server_t dummy_server;
                    dummy_server.listen_socket = reactor->listen_socket;

                    if (tcp_server_accept_nonblocking(&dummy_server, &conn) != 0) {
                        break;
                    }

                    client_session_t *session =
                        (client_session_t *)calloc(1, sizeof(client_session_t));
                    if (!session) {
                        tcp_close(&conn.client_socket);
                        continue;
                    }
                    session->client_socket = conn.client_socket;
                    session->last_active = time(NULL);
                    http_parser_init(&session->parser);
                    http_request_init(&session->current_request);

                    register_client_session(reactor, session);

                    struct epoll_event client_ev;
                    memset(&client_ev, 0, sizeof(client_ev));
                    client_ev.events = EPOLLIN | EPOLLET | EPOLLRDHUP | EPOLLONESHOT;
                    client_ev.data.ptr = session;

                    if (epoll_ctl(reactor->epoll_fd,
                                  EPOLL_CTL_ADD,
                                  conn.client_socket,
                                  &client_ev) < 0) {
                        perror("[REACTOR] epoll_ctl EPOLL_CTL_ADD client_socket");
                        close_client_session(reactor, session);
                    }
                }
            } else {
                client_session_t *session = (client_session_t *)events[i].data.ptr;
                if (events[i].events & (EPOLLRDHUP | EPOLLHUP | EPOLLERR)) {
                    close_client_session(reactor, session);
                } else if (events[i].events & EPOLLIN) {
                    handle_client_io(reactor, session);
                }
            }
        }
    }

    printf("[REACTOR] Event Loop exited.\n");
}

void reactor_stop(reactor_t *reactor) {
    if (reactor) {
        reactor->is_running = false;
    }
}

void reactor_destroy(reactor_t *reactor) {
    if (!reactor) {
        return;
    }
    reactor_stop(reactor);

    // 1. Chờ toàn bộ Worker Threads hoàn thành các tác vụ đang xử lý dở
    if (reactor->worker_pool) {
        thread_pool_destroy(reactor->worker_pool);
        reactor->worker_pool = NULL;
    }

    // 2. Giải phóng toàn bộ các phiên kết nối Keep-Alive còn đang mở (Zero Memory Leaks)
    while (reactor->sessions_head) {
        close_client_session(reactor, reactor->sessions_head);
    }

    // 3. Đóng epoll descriptor và hủy mutex
    if (reactor->epoll_fd >= 0) {
        if (close(reactor->epoll_fd) < 0) {
            perror("[REACTOR] close epoll_fd");
        }
        reactor->epoll_fd = -1;
    }

    pthread_mutex_destroy(&reactor->sessions_lock);
    free(reactor);
}
