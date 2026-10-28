#include "reactor.h"
#include "tcp_socket.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <sys/socket.h>

typedef struct {
    reactor_t *reactor;
    client_session_t *session;
    http_request_t req;
} worker_job_t;

static void send_bad_request(int client_fd) {
    if (client_fd < 0) return;
    const char *bad_req_resp =
        "HTTP/1.1 400 Bad Request\r\n"
        "Content-Type: application/json; charset=utf-8\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "Content-Length: 36\r\n"
        "Connection: close\r\n"
        "\r\n"
        "{\"error\":\"Bad Request\",\"status\":400}";
    tcp_send_all(client_fd, bad_req_resp, strlen(bad_req_resp));
}

static void register_client_session(reactor_t *reactor, client_session_t *session) {
    if (!reactor || !session) return;
    pthread_mutex_lock(&reactor->sessions_lock);
    session->prev = NULL;
    session->next = reactor->sessions_head;
    if (reactor->sessions_head) {
        reactor->sessions_head->prev = session;
    }
    reactor->sessions_head = session;
    pthread_mutex_unlock(&reactor->sessions_lock);
}

static void close_client_session(reactor_t *reactor, client_session_t *session) {
    if (!reactor || !session) return;

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

    if (session->client_fd >= 0) {
        if (reactor->epoll_fd >= 0) {
            epoll_ctl(reactor->epoll_fd, EPOLL_CTL_DEL, session->client_fd, NULL);
        }
        close(session->client_fd);
        session->client_fd = -1;
    }
    http_request_free(&session->current_request);
    free(session);
}

static bool dispatch_and_send_response(reactor_t *reactor, client_session_t *session, http_request_t *req) {
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
        if (tcp_send_all(session->client_fd, serialized, out_len) == (ssize_t)out_len) {
            send_ok = true;
        }
        free(serialized);
    }
    http_response_free(&res);

    bool keep_alive = req->keep_alive && send_ok;
    http_request_free(req);
    return keep_alive;
}

static void worker_execute_job(void *arg) {
    worker_job_t *job = (worker_job_t *)arg;
    if (!job) return;

    reactor_t *reactor = job->reactor;
    client_session_t *session = job->session;

    // 1. Xử lý request đầu tiên đã được bóc tách
    bool keep_alive = dispatch_and_send_response(reactor, session, &job->req);
    free(job);

    if (!keep_alive || session->client_fd < 0) {
        close_client_session(reactor, session);
        return;
    }

    // 2. Sequential Per-Session Drain: Xử lý tuần tự toàn bộ các gói tin dính liền (Sticky / Pipelined)
    // đang nằm sẵn trong accumulation_buffer trước khi re-arm epoll (tránh treo sự kiện EPOLLET)
    while (session->buffer_len > 0) {
        int parsed = http_parser_execute(&session->parser, &session->current_request,
                                         session->accumulation_buffer, session->buffer_len);
        if (parsed > 0) {
            http_request_t next_req = session->current_request;
            size_t consumed = (size_t)parsed;
            memmove(session->accumulation_buffer, session->accumulation_buffer + consumed,
                    session->buffer_len - consumed);
            session->buffer_len -= consumed;

            http_parser_init(&session->parser);
            http_request_init(&session->current_request);

            keep_alive = dispatch_and_send_response(reactor, session, &next_req);
            if (!keep_alive || session->client_fd < 0) {
                close_client_session(reactor, session);
                return;
            }
        } else if (parsed == 0) {
            // Dữ liệu còn dư là một request chưa hoàn chỉnh (Fragmented) -> chờ lần đọc epoll tiếp theo
            break;
        } else {
            // Lỗi cú pháp HTTP trên gói tin pipelined -> trả về 400 Bad Request và đóng phiên
            send_bad_request(session->client_fd);
            close_client_session(reactor, session);
            return;
        }
    }

    // 3. Rearm epoll event cho kết nối persistent Keep-Alive
    if (session->client_fd >= 0 && reactor->is_running) {
        struct epoll_event ev;
        memset(&ev, 0, sizeof(ev));
        ev.events = EPOLLIN | EPOLLET | EPOLLRDHUP | EPOLLONESHOT;
        ev.data.ptr = session;
        if (epoll_ctl(reactor->epoll_fd, EPOLL_CTL_MOD, session->client_fd, &ev) < 0) {
            close_client_session(reactor, session);
        }
    } else {
        close_client_session(reactor, session);
    }
}

static void handle_client_io(reactor_t *reactor, client_session_t *session) {
    while (1) {
        char temp_buf[4096];
        ssize_t n = recv(session->client_fd, temp_buf, sizeof(temp_buf), 0);
        if (n > 0) {
            session->last_active = time(NULL);
            if (session->buffer_len + (size_t)n > ACCUMULATION_BUF_SIZE) {
                // Buffer overflow protection -> gửi 400 Bad Request và đóng kết nối
                send_bad_request(session->client_fd);
                close_client_session(reactor, session);
                return;
            }

            memcpy(session->accumulation_buffer + session->buffer_len, temp_buf, (size_t)n);
            session->buffer_len += (size_t)n;

            int parsed = http_parser_execute(&session->parser, &session->current_request,
                                             session->accumulation_buffer, session->buffer_len);
            if (parsed > 0) {
                // Đã parse xong 1 request hoàn chỉnh! Bàn giao cho Worker Thread
                worker_job_t *job = (worker_job_t *)malloc(sizeof(worker_job_t));
                if (!job) {
                    close_client_session(reactor, session);
                    return;
                }
                job->reactor = reactor;
                job->session = session;
                job->req = session->current_request;

                size_t consumed = (size_t)parsed;
                memmove(session->accumulation_buffer, session->accumulation_buffer + consumed,
                        session->buffer_len - consumed);
                session->buffer_len -= consumed;

                http_parser_init(&session->parser);
                http_request_init(&session->current_request);

                if (thread_pool_submit(reactor->worker_pool, worker_execute_job, job) != 0) {
                    http_request_free(&job->req);
                    free(job);
                    close_client_session(reactor, session);
                }
                return; // epoll sẽ được rearm sau khi worker phản hồi xong
            } else if (parsed < 0) {
                // Gói tin lỗi cú pháp HTTP -> gửi 400 Bad Request và đóng phiên
                send_bad_request(session->client_fd);
                close_client_session(reactor, session);
                return;
            }
            // Nếu parsed == 0 (chưa đủ byte tạo 1 request hoàn chỉnh), tiếp tục vòng lặp recv()
        } else if (n < 0) {
            if (errno == EAGAIN || errno == EWOULDBLOCK) {
                // Đã đọc cạn buffer từ kernel (Edge-Triggered) nhưng request vẫn chưa đủ byte
                struct epoll_event ev;
                memset(&ev, 0, sizeof(ev));
                ev.events = EPOLLIN | EPOLLET | EPOLLRDHUP | EPOLLONESHOT;
                ev.data.ptr = session;
                epoll_ctl(reactor->epoll_fd, EPOLL_CTL_MOD, session->client_fd, &ev);
                break;
            } else if (errno == EINTR) {
                continue;
            } else {
                close_client_session(reactor, session);
                break;
            }
        } else {
            // Client chủ động đóng kết nối (EOF)
            close_client_session(reactor, session);
            break;
        }
    }
}

reactor_t *reactor_create(int listen_fd, http_router_t *router, size_t worker_threads) {
    if (listen_fd < 0 || !router) return NULL;

    tcp_set_nonblocking(listen_fd);

    int epoll_fd = epoll_create1(0);
    if (epoll_fd < 0) {
        perror("[REACTOR] epoll_create1 failed");
        return NULL;
    }

    struct epoll_event ev;
    memset(&ev, 0, sizeof(ev));
    ev.events = EPOLLIN | EPOLLET;
    ev.data.fd = listen_fd;

    if (epoll_ctl(epoll_fd, EPOLL_CTL_ADD, listen_fd, &ev) < 0) {
        perror("[REACTOR] epoll_ctl(EPOLL_CTL_ADD, listen_fd) failed");
        close(epoll_fd);
        return NULL;
    }

    reactor_t *reactor = (reactor_t *)calloc(1, sizeof(reactor_t));
    if (!reactor) {
        close(epoll_fd);
        return NULL;
    }

    reactor->epoll_fd = epoll_fd;
    reactor->listen_fd = listen_fd;
    reactor->router = router;
    reactor->is_running = false;
    reactor->sessions_head = NULL;
    pthread_mutex_init(&reactor->sessions_lock, NULL);
    reactor->worker_pool = thread_pool_create(worker_threads);

    return reactor;
}

void reactor_run_event_loop(reactor_t *reactor) {
    if (!reactor) return;
    reactor->is_running = true;
    struct epoll_event events[MAX_EPOLL_EVENTS];

    printf("[REACTOR] Event Loop started with epoll (Single-thread Demux + Worker ThreadPool)\n");

    while (reactor->is_running) {
        int n_fds = epoll_wait(reactor->epoll_fd, events, MAX_EPOLL_EVENTS, 500);
        if (n_fds < 0) {
            if (errno == EINTR) continue;
            break;
        }

        for (int i = 0; i < n_fds; i++) {
            if (events[i].data.fd == reactor->listen_fd) {
                // Sự kiện Acceptor: Nhận kết nối mới
                while (1) {
                    tcp_client_conn_t conn;
                    tcp_server_t dummy_server;
                    dummy_server.server_fd = reactor->listen_fd;

                    if (tcp_server_accept_nonblocking(&dummy_server, &conn) != 0) {
                        break; // Đã nhận hết các kết nối đang chờ trong hàng đợi kernel
                    }

                    client_session_t *session = (client_session_t *)calloc(1, sizeof(client_session_t));
                    if (!session) {
                        close(conn.client_fd);
                        continue;
                    }
                    session->client_fd = conn.client_fd;
                    session->last_active = time(NULL);
                    http_parser_init(&session->parser);
                    http_request_init(&session->current_request);

                    register_client_session(reactor, session);

                    struct epoll_event client_ev;
                    memset(&client_ev, 0, sizeof(client_ev));
                    client_ev.events = EPOLLIN | EPOLLET | EPOLLRDHUP | EPOLLONESHOT;
                    client_ev.data.ptr = session;

                    if (epoll_ctl(reactor->epoll_fd, EPOLL_CTL_ADD, conn.client_fd, &client_ev) < 0) {
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
    if (!reactor) return;
    reactor_stop(reactor);

    // 1. Chờ toàn bộ Worker Threads hoàn thành các job đang xử lý
    if (reactor->worker_pool) {
        thread_pool_destroy(reactor->worker_pool);
        reactor->worker_pool = NULL;
    }

    // 2. Giải phóng toàn bộ các phiên kết nối Keep-Alive còn đang mở (đảm bảo 0 memory leaks)
    while (reactor->sessions_head) {
        close_client_session(reactor, reactor->sessions_head);
    }

    // 3. Đóng epoll fd và hủy mutex
    if (reactor->epoll_fd >= 0) {
        close(reactor->epoll_fd);
        reactor->epoll_fd = -1;
    }

    pthread_mutex_destroy(&reactor->sessions_lock);
    free(reactor);
}
