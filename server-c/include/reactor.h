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

typedef struct client_session {
    int client_fd;
    char accumulation_buffer[ACCUMULATION_BUF_SIZE];
    size_t buffer_len;
    http_parser_t parser;
    http_request_t current_request;
    time_t last_active;
    struct client_session *prev;
    struct client_session *next;
} client_session_t;

typedef struct {
    int epoll_fd;
    int listen_fd;
    volatile bool is_running;
    thread_pool_t *worker_pool;
    http_router_t *router;
    pthread_mutex_t sessions_lock;
    client_session_t *sessions_head;
} reactor_t;

reactor_t *reactor_create(int listen_fd, http_router_t *router, size_t worker_threads);
void reactor_run_event_loop(reactor_t *reactor);
void reactor_stop(reactor_t *reactor);
void reactor_destroy(reactor_t *reactor);

#endif // REACTOR_H
