#include "in_memory_store.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static size_t g_exam_seq = 1;
static size_t g_quest_seq = 1;

void store_init(in_memory_store_t *store) {
    if (!store) return;
    memset(store, 0, sizeof(in_memory_store_t));
    pthread_rwlock_init(&store->rwlock, NULL);

    // Dữ liệu mẫu ban đầu
    exam_entity_t sample_exam;
    memset(&sample_exam, 0, sizeof(sample_exam));
    strncpy(sample_exam.id, "exam-1", sizeof(sample_exam.id) - 1);
    strncpy(sample_exam.title, "Kỳ thi Lập trình Hệ thống & Mạng C", sizeof(sample_exam.title) - 1);
    strncpy(sample_exam.description, "Đánh giá kiến thức Socket, HTTP/1.1 và Reactor Pattern", sizeof(sample_exam.description) - 1);
    sample_exam.duration_minutes = 60;
    sample_exam.question_count = 1;
    sample_exam.created_at = time(NULL);

    store->exams[0] = sample_exam;
    store->exam_count = 1;
    g_exam_seq = 2;

    question_entity_t sample_q;
    memset(&sample_q, 0, sizeof(sample_q));
    strncpy(sample_q.id, "q-1", sizeof(sample_q.id) - 1);
    strncpy(sample_q.exam_id, "exam-1", sizeof(sample_q.exam_id) - 1);
    strncpy(sample_q.content, "Trong mô hình Doug Lea Reactor, thành phần nào chịu trách nhiệm dồn kênh sự kiện I/O?", sizeof(sample_q.content) - 1);
    strncpy(sample_q.options[0], "Worker ThreadPool", sizeof(sample_q.options[0]) - 1);
    strncpy(sample_q.options[1], "I/O Demultiplexer (epoll/Selector)", sizeof(sample_q.options[1]) - 1);
    strncpy(sample_q.options[2], "Acceptor", sizeof(sample_q.options[2]) - 1);
    strncpy(sample_q.options[3], "HTTP Parser", sizeof(sample_q.options[3]) - 1);
    sample_q.correct_option = 1;

    store->questions[0] = sample_q;
    store->question_count = 1;
    g_quest_seq = 2;
}

void store_destroy(in_memory_store_t *store) {
    if (!store) return;
    pthread_rwlock_destroy(&store->rwlock);
}

int store_get_all_exams(in_memory_store_t *store, exam_entity_t *out_exams, size_t max_out) {
    if (!store || !out_exams || max_out == 0) return 0;
    pthread_rwlock_rdlock(&store->rwlock);
    size_t count = store->exam_count < max_out ? store->exam_count : max_out;
    for (size_t i = 0; i < count; i++) {
        out_exams[i] = store->exams[i];
    }
    pthread_rwlock_unlock(&store->rwlock);
    return (int)count;
}

int store_get_exam_by_id(in_memory_store_t *store, const char *id, exam_entity_t *out_exam) {
    if (!store || !id || !out_exam) return -1;
    pthread_rwlock_rdlock(&store->rwlock);
    int res = -1;
    for (size_t i = 0; i < store->exam_count; i++) {
        if (strcmp(store->exams[i].id, id) == 0) {
            *out_exam = store->exams[i];
            res = 0;
            break;
        }
    }
    pthread_rwlock_unlock(&store->rwlock);
    return res;
}

int store_create_exam(in_memory_store_t *store, const exam_entity_t *exam, char *out_id, size_t id_len) {
    if (!store || !exam || !out_id || id_len == 0) return -1;
    pthread_rwlock_wrlock(&store->rwlock);
    if (store->exam_count >= MAX_EXAMS) {
        pthread_rwlock_unlock(&store->rwlock);
        return -1;
    }

    exam_entity_t *new_exam = &store->exams[store->exam_count++];
    *new_exam = *exam;
    snprintf(new_exam->id, sizeof(new_exam->id), "exam-%zu", g_exam_seq++);
    new_exam->question_count = 0;
    new_exam->created_at = time(NULL);

    strncpy(out_id, new_exam->id, id_len - 1);
    out_id[id_len - 1] = '\0';

    pthread_rwlock_unlock(&store->rwlock);
    return 0;
}

int store_update_exam(in_memory_store_t *store, const char *id, const exam_entity_t *exam) {
    if (!store || !id || !exam) return -1;
    pthread_rwlock_wrlock(&store->rwlock);
    int res = -1;
    for (size_t i = 0; i < store->exam_count; i++) {
        if (strcmp(store->exams[i].id, id) == 0) {
            strncpy(store->exams[i].title, exam->title, sizeof(store->exams[i].title) - 1);
            strncpy(store->exams[i].description, exam->description, sizeof(store->exams[i].description) - 1);
            if (exam->duration_minutes > 0) {
                store->exams[i].duration_minutes = exam->duration_minutes;
            }
            res = 0;
            break;
        }
    }
    pthread_rwlock_unlock(&store->rwlock);
    return res;
}

int store_delete_exam(in_memory_store_t *store, const char *id) {
    if (!store || !id) return -1;
    pthread_rwlock_wrlock(&store->rwlock);
    int found_idx = -1;
    for (size_t i = 0; i < store->exam_count; i++) {
        if (strcmp(store->exams[i].id, id) == 0) {
            found_idx = (int)i;
            break;
        }
    }

    if (found_idx == -1) {
        pthread_rwlock_unlock(&store->rwlock);
        return -1;
    }

    // Dịch mảng exams
    for (size_t i = (size_t)found_idx; i < store->exam_count - 1; i++) {
        store->exams[i] = store->exams[i + 1];
    }
    store->exam_count--;

    // Xóa các câu hỏi thuộc exam này
    size_t new_q_count = 0;
    for (size_t i = 0; i < store->question_count; i++) {
        if (strcmp(store->questions[i].exam_id, id) != 0) {
            store->questions[new_q_count++] = store->questions[i];
        }
    }
    store->question_count = new_q_count;

    pthread_rwlock_unlock(&store->rwlock);
    return 0;
}

int store_get_questions_by_exam_id(in_memory_store_t *store, const char *exam_id, question_entity_t *out_questions, size_t max_out) {
    if (!store || !exam_id || !out_questions || max_out == 0) return 0;
    pthread_rwlock_rdlock(&store->rwlock);
    size_t count = 0;
    for (size_t i = 0; i < store->question_count && count < max_out; i++) {
        if (strcmp(store->questions[i].exam_id, exam_id) == 0) {
            out_questions[count++] = store->questions[i];
        }
    }
    pthread_rwlock_unlock(&store->rwlock);
    return (int)count;
}

int store_create_question(in_memory_store_t *store, const question_entity_t *question, char *out_id, size_t id_len) {
    if (!store || !question || !out_id || id_len == 0) return -1;
    pthread_rwlock_wrlock(&store->rwlock);
    if (store->question_count >= MAX_QUESTIONS) {
        pthread_rwlock_unlock(&store->rwlock);
        return -1;
    }

    // Kiểm tra xem exam_id có tồn tại không
    bool exam_exists = false;
    for (size_t i = 0; i < store->exam_count; i++) {
        if (strcmp(store->exams[i].id, question->exam_id) == 0) {
            store->exams[i].question_count++;
            exam_exists = true;
            break;
        }
    }

    if (!exam_exists) {
        pthread_rwlock_unlock(&store->rwlock);
        return -1;
    }

    question_entity_t *new_q = &store->questions[store->question_count++];
    *new_q = *question;
    snprintf(new_q->id, sizeof(new_q->id), "q-%zu", g_quest_seq++);

    strncpy(out_id, new_q->id, id_len - 1);
    out_id[id_len - 1] = '\0';

    pthread_rwlock_unlock(&store->rwlock);
    return 0;
}
