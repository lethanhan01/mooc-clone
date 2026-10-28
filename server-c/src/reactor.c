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

static void close_client_session(reactor_t *reactor, client_session_t *session) {
    if (!session) return;
    if (session->client_fd >= 0) {
        epoll_ctl(reactor->epoll_fd, EPOLL_CTL_DEL, session->client_fd, NULL);
        close(session->client_fd);
        session->client_fd = -1;
    }
    http_request_free(&session->current_request);
    free(session);
}

static void worker_execute_job(void *arg) {
    worker_job_t *job = (worker_job_t *)arg;
    if (!job) return;

    http_response_t res;
    http_router_dispatch(job->reactor->router, &job->req, &res);

    if (job->req.keep_alive) {
        http_response_add_header(&res, "Connection", "keep-alive");
    } else {
        http_response_add_header(&res, "Connection", "close");
    }

    size_t out_len = 0;
    char *serialized = http_response_serialize(&res, &out_len);
    if (serialized) {
        tcp_send_all(job->session->client_fd, serialized, out_len);
        free(serialized);
    }
    http_response_free(&res);

    bool keep_alive = job->req.keep_alive;
    http_request_free(&job->req);

    if (keep_alive && job->session->client_fd >= 0) {
        // Rearm epoll event for next request on this persistent connection
        struct epoll_event ev;
        memset(&ev, 0, sizeof(ev));
        ev.events = EPOLLIN | EPOLLET | EPOLLRDHUP | EPOLLONESHOT;
        ev.data.ptr = job->session;
        epoll_ctl(job->reactor->epoll_fd, EPOLL_CTL_MOD, job->session->client_fd, &ev);
    } else {
        close_client_session(job->reactor, job->session);
    }

    free(job);
}

static void handle_client_io(reactor_t *reactor, client_session_t *session) {
    while (1) {
        char temp_buf[4096];
        ssize_t n = recv(session->client_fd, temp_buf, sizeof(temp_buf), 0);
        if (n > 0) {
            session->last_active = time(NULL);
            if (session->buffer_len + (size_t)n > ACCUMULATION_BUF_SIZE) {
                // Buffer overflow protection
                close_client_session(reactor, session);
                return;
            }

            memcpy(session->accumulation_buffer + session->buffer_len, temp_buf, (size_t)n);
            session->buffer_len += (size_t)n;

            // Vòng lặp bóc tách toàn bộ gói tin hoàn chỉnh (chống dính gói tin)
            while (session->buffer_len > 0) {
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

                    thread_pool_submit(reactor->worker_pool, worker_execute_job, job);
                    return; // epoll sẽ được rearm sau khi worker phản hồi xong
                } else if (parsed == 0) {
                    // Chưa đủ byte để tạo 1 request hoàn chỉnh (phân mảnh gói tin)
                    break;
                } else {
                    // Gói tin lỗi cú pháp
                    close_client_session(reactor, session);
                    return;
                }
            }
        } else if (n < 0) {
            if (errno == EAGAIN || errno == EWOULDBLOCK) {
                // Đã đọc cạn buffer từ kernel (Edge-Triggered)
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

                    struct epoll_event client_ev;
                    memset(&client_ev, 0, sizeof(client_ev));
                    client_ev.events = EPOLLIN | EPOLLET | EPOLLRDHUP | EPOLLONESHOT;
                    client_ev.data.ptr = session;

                    if (epoll_ctl(reactor->epoll_fd, EPOLL_CTL_ADD, conn.client_fd, &client_ev) < 0) {
                        close(conn.client_fd);
                        free(session);
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

    if (reactor->epoll_fd >= 0) {
        close(reactor->epoll_fd);
        reactor->epoll_fd = -1;
    }

    if (reactor->worker_pool) {
        thread_pool_destroy(reactor->worker_pool);
        reactor->worker_pool = NULL;
    }

    free(reactor);
}
