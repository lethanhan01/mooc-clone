#ifndef THREAD_POOL_H
#define THREAD_POOL_H

#include <pthread.h>
#include <stdbool.h>
#include <stddef.h>

#define DEFAULT_THREAD_POOL_SIZE 4

/**
 * @brief Kiểu con trỏ hàm đại diện cho một tác vụ thực thi bởi Worker Thread.
 */
typedef void (*task_func_t)(void *arg);

/**
 * @brief Cấu trúc một nút tác vụ (Task Node) trong hàng đợi liên kết đơn.
 */
typedef struct task {
    task_func_t function;
    void *argument;
    struct task *next;
} task_t;

/**
 * @brief Cấu trúc quản lý nhóm luồng công nhân (POSIX Thread Pool).
 *
 * Kết hợp Mutex và Condition Variable để đồng bộ hóa hàng đợi tác vụ theo mô hình
 * Producer - Consumer mà không gây tiêu tốn CPU (busy-waiting).
 */
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

/**
 * @brief Khởi tạo Thread Pool và cấp phát trước một số lượng cố định các luồng công nhân.
 *
 * @param[in] num_threads Số lượng luồng công nhân cần tạo (nếu truyền 0 sẽ dùng mặc định 4).
 * @return thread_pool_t* Con trỏ tới Thread Pool vừa tạo, hoặc NULL nếu lỗi cấp phát.
 */
thread_pool_t *thread_pool_create(size_t num_threads);

/**
 * @brief Đẩy một tác vụ mới vào cuối hàng đợi của Thread Pool và đánh thức 1 Worker Thread.
 *
 * @param[in,out] pool Con trỏ tới Thread Pool.
 * @param[in]     func Hàm xử lý tác vụ.
 * @param[in]     arg  Con trỏ dữ liệu ngữ cảnh truyền vào hàm func.
 * @return int 0 nếu đẩy vào hàng đợi thành công, -1 nếu pool đang tắt hoặc lỗi bộ nhớ.
 */
int thread_pool_submit(thread_pool_t *pool, task_func_t func, void *arg);

/**
 * @brief Phát tín hiệu dừng tới tất cả các luồng và chờ (join) toàn bộ luồng kết thúc.
 *
 * @param[in,out] pool Con trỏ tới Thread Pool cần dừng.
 */
void thread_pool_shutdown(thread_pool_t *pool);

/**
 * @brief Dừng toàn bộ luồng, dọn dẹp hàng đợi tác vụ tồn đọng và giải phóng bộ nhớ Pool.
 *
 * @param[in,out] pool Con trỏ tới Thread Pool cần hủy.
 */
void thread_pool_destroy(thread_pool_t *pool);

#endif // THREAD_POOL_H
