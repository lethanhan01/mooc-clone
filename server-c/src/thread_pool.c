#include "thread_pool.h"

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

/**
 * @brief Vòng lặp chính của mỗi luồng công nhân (Worker Thread) trong Thread Pool.
 *
 * Luồng ngủ chờ trên biến điều kiện (notify) cho tới khi có tác vụ mới trong hàng đợi
 * hoặc nhận tín hiệu shutdown từ tiến trình chính.
 *
 * @param[in] arg Con trỏ tới cấu trúc thread_pool_t.
 * @return void* Luôn trả về NULL khi luồng kết thúc.
 */
static void *worker_thread_func(void *arg) {
    thread_pool_t *pool = (thread_pool_t *)arg;

    while (1) {
        pthread_mutex_lock(&pool->lock);

        // Sử dụng vòng lặp while thay vì if để bảo vệ trước hiện tượng đánh thức giả
        // (Spurious Wakeup) của pthread_cond_wait trên nhân POSIX.
        while (pool->queue_size == 0 && !pool->shutdown) {
            pthread_cond_wait(&pool->notify, &pool->lock);
        }

        if (pool->shutdown && pool->queue_size == 0) {
            pthread_mutex_unlock(&pool->lock);
            pthread_exit(NULL);
        }

        task_t *task = pool->queue_head;
        if (task) {
            pool->queue_head = task->next;
            if (!pool->queue_head) {
                pool->queue_tail = NULL;
            }
            pool->queue_size--;
        }

        pthread_mutex_unlock(&pool->lock);

        if (task) {
            if (task->function) {
                task->function(task->argument);
            }
            free(task);
        }
    }

    return NULL;
}

thread_pool_t *thread_pool_create(size_t num_threads) {
    if (num_threads == 0) {
        num_threads = DEFAULT_THREAD_POOL_SIZE;
    }

    thread_pool_t *pool = (thread_pool_t *)calloc(1, sizeof(thread_pool_t));
    if (!pool) {
        return NULL;
    }

    pool->thread_count = num_threads;
    pool->shutdown = false;

    if (pthread_mutex_init(&pool->lock, NULL) != 0 ||
        pthread_cond_init(&pool->notify, NULL) != 0) {
        free(pool);
        return NULL;
    }

    pool->threads = (pthread_t *)malloc(sizeof(pthread_t) * num_threads);
    if (!pool->threads) {
        pthread_mutex_destroy(&pool->lock);
        pthread_cond_destroy(&pool->notify);
        free(pool);
        return NULL;
    }

    for (size_t i = 0; i < num_threads; i++) {
        if (pthread_create(&pool->threads[i], NULL, worker_thread_func, pool) != 0) {
            thread_pool_destroy(pool);
            return NULL;
        }
    }

    return pool;
}

int thread_pool_submit(thread_pool_t *pool, task_func_t func, void *arg) {
    if (!pool || !func) {
        return -1;
    }

    task_t *task = (task_t *)malloc(sizeof(task_t));
    if (!task) {
        return -1;
    }
    task->function = func;
    task->argument = arg;
    task->next = NULL;

    pthread_mutex_lock(&pool->lock);

    if (pool->shutdown) {
        pthread_mutex_unlock(&pool->lock);
        free(task);
        return -1;
    }

    if (pool->queue_tail) {
        pool->queue_tail->next = task;
        pool->queue_tail = task;
    } else {
        pool->queue_head = task;
        pool->queue_tail = task;
    }
    pool->queue_size++;

    pthread_cond_signal(&pool->notify);
    pthread_mutex_unlock(&pool->lock);
    return 0;
}

void thread_pool_shutdown(thread_pool_t *pool) {
    if (!pool) {
        return;
    }

    pthread_mutex_lock(&pool->lock);
    if (pool->shutdown) {
        pthread_mutex_unlock(&pool->lock);
        return;
    }
    pool->shutdown = true;
    pthread_cond_broadcast(&pool->notify);
    pthread_mutex_unlock(&pool->lock);

    for (size_t i = 0; i < pool->thread_count; i++) {
        pthread_join(pool->threads[i], NULL);
    }
}

void thread_pool_destroy(thread_pool_t *pool) {
    if (!pool) {
        return;
    }

    thread_pool_shutdown(pool);

    pthread_mutex_lock(&pool->lock);
    task_t *curr = pool->queue_head;
    while (curr) {
        task_t *next = curr->next;
        free(curr);
        curr = next;
    }
    pool->queue_head = NULL;
    pool->queue_tail = NULL;
    pool->queue_size = 0;
    pthread_mutex_unlock(&pool->lock);

    pthread_mutex_destroy(&pool->lock);
    pthread_cond_destroy(&pool->notify);

    if (pool->threads) {
        free(pool->threads);
        pool->threads = NULL;
    }
    free(pool);
}
