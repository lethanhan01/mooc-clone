#ifndef THREAD_POOL_H
#define THREAD_POOL_H

#include <pthread.h>
#include <stdbool.h>
#include <stddef.h>

typedef void (*task_func_t)(void *arg);

typedef struct task {
    task_func_t function;
    void *argument;
    struct task *next;
} task_t;

typedef struct {
    pthread_mutex_t lock;
    pthread_cond_t notify;
    pthread_t *threads;
    task_t *queue_head;
    task_t *queue_tail;
    size_t thread_count;
    size_t queue_size;
    bool shutdown;
} thread_pool_t;

thread_pool_t *thread_pool_create(size_t num_threads);
int thread_pool_submit(thread_pool_t *pool, task_func_t func, void *arg);
void thread_pool_shutdown(thread_pool_t *pool);
void thread_pool_destroy(thread_pool_t *pool);

#endif // THREAD_POOL_H
