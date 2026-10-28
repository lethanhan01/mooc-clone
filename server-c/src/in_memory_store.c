#include "in_memory_store.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static size_t g_exam_seq = 1;
static size_t g_quest_seq = 1;
static size_t g_room_seq = 1;

int64_t get_server_now_ms(void) {
    struct timespec ts;
    if (clock_gettime(CLOCK_REALTIME, &ts) == 0) {
        return (int64_t)ts.tv_sec * MS_PER_SECOND + (int64_t)(ts.tv_nsec / NS_PER_MS);
    }
    return (int64_t)time(NULL) * MS_PER_SECOND;
}

const char *room_status_str(room_status_t status) {
    switch (status) {
        case ROOM_STATUS_WAITING: {
            return "WAITING";
        }
        case ROOM_STATUS_RUNNING: {
            return "RUNNING";
        }
        case ROOM_STATUS_ENDED: {
            return "ENDED";
        }
        default: {
            return "WAITING";
        }
    }
}

/**
 * @brief Đánh giá hết hạn lười (Lazy Expiration) cho phòng thi khi có truy vấn đọc/ghi.
 *
 * Giúp máy chủ HTTP/1.1 tự động khóa sổ phòng thi đúng hạn ở thời điểm O(1) mà không
 * cần duy trì luồng bộ đếm thời gian ngầm (background timer thread) cho từng phòng.
 * Hàm này yêu cầu luồng gọi đã giữ khóa ghi (wrlock) trên in_memory_store_t.
 *
 * @param[in,out] room   Con trỏ tới thực thể phòng thi cần kiểm tra hạn giờ.
 * @param[in]     now_ms Mốc thời gian chuẩn hiện tại của máy chủ (ms).
 */
static void lazy_evaluate_room_locked(exam_room_t *room, int64_t now_ms) {
    if (!room) {
        return;
    }
    if (room->status == ROOM_STATUS_RUNNING &&
        room->ends_at_ms > 0 &&
        now_ms >= room->ends_at_ms) {
        room->status = ROOM_STATUS_ENDED;
        room->ended_at_ms = room->ends_at_ms;
        // Tự động chốt trạng thái đã nộp (auto-finalize) cho mọi thí sinh trong phòng
        for (size_t i = 0; i < room->participant_count; i++) {
            room->submitted[i] = true;
        }
    }
}

void store_init(in_memory_store_t *store) {
    if (!store) {
        return;
    }
    memset(store, 0, sizeof(in_memory_store_t));
    pthread_rwlock_init(&store->rwlock, NULL);

    // Khởi tạo đề thi mẫu phục vụ kiểm thử tự động ngay khi bật server
    exam_entity_t sample_exam;
    memset(&sample_exam, 0, sizeof(sample_exam));
    strncpy(sample_exam.id, "exam-1", sizeof(sample_exam.id) - 1);
    strncpy(sample_exam.title,
            "Kỳ thi Lập trình Hệ thống & Mạng C",
            sizeof(sample_exam.title) - 1);
    strncpy(sample_exam.description,
            "Đánh giá kiến thức Socket, HTTP/1.1 và Reactor Pattern",
            sizeof(sample_exam.description) - 1);
    sample_exam.duration_minutes = SEED_EXAM_DURATION_MIN;
    sample_exam.question_count = 1;
    sample_exam.created_at = time(NULL);

    store->exams[0] = sample_exam;
    store->exam_count = 1;
    g_exam_seq = 2;

    question_entity_t sample_question;
    memset(&sample_question, 0, sizeof(sample_question));
    strncpy(sample_question.id, "q-1", sizeof(sample_question.id) - 1);
    strncpy(sample_question.exam_id, "exam-1", sizeof(sample_question.exam_id) - 1);
    strncpy(sample_question.content,
            "Trong mô hình Doug Lea Reactor, thành phần nào dồn kênh sự kiện I/O?",
            sizeof(sample_question.content) - 1);
    strncpy(sample_question.options[0],
            "Worker ThreadPool",
            sizeof(sample_question.options[0]) - 1);
    strncpy(sample_question.options[1],
            "I/O Demultiplexer (epoll/Selector)",
            sizeof(sample_question.options[1]) - 1);
    strncpy(sample_question.options[2],
            "Acceptor",
            sizeof(sample_question.options[2]) - 1);
    strncpy(sample_question.options[3],
            "HTTP Parser",
            sizeof(sample_question.options[3]) - 1);
    sample_question.correct_option = 1;

    store->questions[0] = sample_question;
    store->question_count = 1;
    g_quest_seq = 2;

    // Phòng thi mẫu mặc định ở trạng thái WAITING
    exam_room_t sample_room;
    memset(&sample_room, 0, sizeof(sample_room));
    strncpy(sample_room.id, "room-1", sizeof(sample_room.id) - 1);
    strncpy(sample_room.room_code, "ROOM01", sizeof(sample_room.room_code) - 1);
    strncpy(sample_room.name,
            "Phòng Thi Hệ Thống C & Mạng Máy Tính",
            sizeof(sample_room.name) - 1);
    strncpy(sample_room.exam_id, "exam-1", sizeof(sample_room.exam_id) - 1);
    sample_room.status = ROOM_STATUS_WAITING;
    sample_room.duration_seconds = DEFAULT_ROOM_DURATION_SEC;

    store->rooms[0] = sample_room;
    store->room_count = 1;
    g_room_seq = 2;
}

void store_destroy(in_memory_store_t *store) {
    if (!store) {
        return;
    }
    pthread_rwlock_destroy(&store->rwlock);
}

int store_get_all_exams(in_memory_store_t *store,
                        exam_entity_t *out_exams,
                        size_t max_out) {
    if (!store || !out_exams || max_out == 0) {
        return 0;
    }
    // Sử dụng Read Lock (rdlock) cho phép nhiều luồng Worker đọc danh sách đề thi song song
    pthread_rwlock_rdlock(&store->rwlock);
    size_t count = store->exam_count < max_out ? store->exam_count : max_out;
    for (size_t i = 0; i < count; i++) {
        out_exams[i] = store->exams[i];
    }
    pthread_rwlock_unlock(&store->rwlock);
    return (int)count;
}

int store_get_exam_by_id(in_memory_store_t *store,
                         const char *id,
                         exam_entity_t *out_exam) {
    if (!store || !id || !out_exam) {
        return -1;
    }
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

int store_create_exam(in_memory_store_t *store,
                      const exam_entity_t *exam,
                      char *out_id,
                      size_t id_len) {
    if (!store || !exam || !out_id || id_len == 0) {
        return -1;
    }
    // Sử dụng Write Lock (wrlock) độc quyền khi thay đổi trạng thái mảng lưu trữ
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

int store_update_exam(in_memory_store_t *store,
                      const char *id,
                      const exam_entity_t *exam) {
    if (!store || !id || !exam) {
        return -1;
    }
    pthread_rwlock_wrlock(&store->rwlock);
    int res = -1;
    for (size_t i = 0; i < store->exam_count; i++) {
        if (strcmp(store->exams[i].id, id) == 0) {
            strncpy(store->exams[i].title,
                    exam->title,
                    sizeof(store->exams[i].title) - 1);
            strncpy(store->exams[i].description,
                    exam->description,
                    sizeof(store->exams[i].description) - 1);
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
    if (!store || !id) {
        return -1;
    }
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

    for (size_t i = (size_t)found_idx; i < store->exam_count - 1; i++) {
        store->exams[i] = store->exams[i + 1];
    }
    store->exam_count--;

    // Xóa dây chuyền (Cascade Delete) các câu hỏi thuộc đề thi vừa xóa để tránh dữ liệu mồ côi
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

int store_get_questions_by_exam_id(in_memory_store_t *store,
                                   const char *exam_id,
                                   question_entity_t *out_questions,
                                   size_t max_out) {
    if (!store || !exam_id || !out_questions || max_out == 0) {
        return 0;
    }
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

int store_create_question(in_memory_store_t *store,
                          const question_entity_t *question,
                          char *out_id,
                          size_t id_len) {
    if (!store || !question || !out_id || id_len == 0) {
        return -1;
    }
    pthread_rwlock_wrlock(&store->rwlock);
    if (store->question_count >= MAX_QUESTIONS) {
        pthread_rwlock_unlock(&store->rwlock);
        return -1;
    }

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

    question_entity_t *new_question = &store->questions[store->question_count++];
    *new_question = *question;
    snprintf(new_question->id, sizeof(new_question->id), "q-%zu", g_quest_seq++);

    strncpy(out_id, new_question->id, id_len - 1);
    out_id[id_len - 1] = '\0';

    pthread_rwlock_unlock(&store->rwlock);
    return 0;
}

int store_get_all_rooms(in_memory_store_t *store,
                        exam_room_t *out_rooms,
                        size_t max_out) {
    if (!store || !out_rooms || max_out == 0) {
        return 0;
    }
    // Giữ wrlock vì lazy_evaluate_room_locked có thể cập nhật trạng thái phòng sang ENDED
    pthread_rwlock_wrlock(&store->rwlock);
    int64_t now_ms = get_server_now_ms();
    size_t count = store->room_count < max_out ? store->room_count : max_out;
    for (size_t i = 0; i < count; i++) {
        lazy_evaluate_room_locked(&store->rooms[i], now_ms);
        out_rooms[i] = store->rooms[i];
    }
    pthread_rwlock_unlock(&store->rwlock);
    return (int)count;
}

int store_get_room_by_code(in_memory_store_t *store,
                           const char *room_code,
                           exam_room_t *out_room) {
    if (!store || !room_code || !out_room) {
        return -1;
    }
    pthread_rwlock_wrlock(&store->rwlock);
    int64_t now_ms = get_server_now_ms();
    int res = -1;
    for (size_t i = 0; i < store->room_count; i++) {
        if (strcmp(store->rooms[i].room_code, room_code) == 0) {
            lazy_evaluate_room_locked(&store->rooms[i], now_ms);
            *out_room = store->rooms[i];
            res = 0;
            break;
        }
    }
    pthread_rwlock_unlock(&store->rwlock);
    return res;
}

int store_create_room(in_memory_store_t *store,
                      const exam_room_t *room,
                      exam_room_t *out_room) {
    if (!store || !room || room->room_code[0] == '\0') {
        return -1;
    }
    pthread_rwlock_wrlock(&store->rwlock);
    if (store->room_count >= MAX_ROOMS) {
        pthread_rwlock_unlock(&store->rwlock);
        return -1;
    }

    for (size_t i = 0; i < store->room_count; i++) {
        if (strcmp(store->rooms[i].room_code, room->room_code) == 0) {
            pthread_rwlock_unlock(&store->rwlock);
            return -2;
        }
    }

    exam_room_t *new_room = &store->rooms[store->room_count++];
    memset(new_room, 0, sizeof(exam_room_t));
    snprintf(new_room->id, sizeof(new_room->id), "room-%zu", g_room_seq++);
    strncpy(new_room->room_code, room->room_code, sizeof(new_room->room_code) - 1);
    strncpy(new_room->name,
            room->name[0] ? room->name : "Phòng thi trực tuyến",
            sizeof(new_room->name) - 1);
    strncpy(new_room->exam_id,
            room->exam_id[0] ? room->exam_id : "exam-1",
            sizeof(new_room->exam_id) - 1);
    new_room->status = ROOM_STATUS_WAITING;
    new_room->duration_seconds =
        room->duration_seconds > 0 ? room->duration_seconds : DEFAULT_ROOM_DURATION_SEC;

    if (out_room) {
        *out_room = *new_room;
    }

    pthread_rwlock_unlock(&store->rwlock);
    return 0;
}

int store_join_room(in_memory_store_t *store,
                    const char *room_code,
                    const char *username,
                    exam_room_t *out_room) {
    if (!store || !room_code || !username || username[0] == '\0') {
        return -1;
    }
    pthread_rwlock_wrlock(&store->rwlock);
    int64_t now_ms = get_server_now_ms();
    int res = -1;

    for (size_t i = 0; i < store->room_count; i++) {
        exam_room_t *room = &store->rooms[i];
        if (strcmp(room->room_code, room_code) == 0) {
            lazy_evaluate_room_locked(room, now_ms);
            if (room->status == ROOM_STATUS_ENDED) {
                res = -2;
                break;
            }
            bool exists = false;
            for (size_t j = 0; j < room->participant_count; j++) {
                if (strcmp(room->participants[j], username) == 0) {
                    exists = true;
                    break;
                }
            }
            if (!exists && room->participant_count < MAX_ROOM_PARTICIPANTS) {
                size_t idx = room->participant_count++;
                strncpy(room->participants[idx],
                        username,
                        sizeof(room->participants[0]) - 1);
                room->scores[idx] = 0;
                room->submitted[idx] = false;
            }
            if (out_room) {
                *out_room = *room;
            }
            res = 0;
            break;
        }
    }

    pthread_rwlock_unlock(&store->rwlock);
    return res;
}

int store_start_room(in_memory_store_t *store,
                     const char *room_code,
                     exam_room_t *out_room) {
    if (!store || !room_code) {
        return -1;
    }
    pthread_rwlock_wrlock(&store->rwlock);
    int64_t now_ms = get_server_now_ms();
    int res = -1;

    for (size_t i = 0; i < store->room_count; i++) {
        exam_room_t *room = &store->rooms[i];
        if (strcmp(room->room_code, room_code) == 0) {
            lazy_evaluate_room_locked(room, now_ms);
            if (room->status == ROOM_STATUS_WAITING) {
                room->status = ROOM_STATUS_RUNNING;
                room->started_at_ms = now_ms;
                room->ends_at_ms =
                    now_ms + (int64_t)room->duration_seconds * MS_PER_SECOND;
            }
            if (out_room) {
                *out_room = *room;
            }
            res = 0;
            break;
        }
    }

    pthread_rwlock_unlock(&store->rwlock);
    return res;
}

int store_submit_room_attempt(in_memory_store_t *store,
                              const char *room_code,
                              const char *username,
                              int score,
                              exam_room_t *out_room) {
    if (!store || !room_code || !username || username[0] == '\0') {
        return -1;
    }
    pthread_rwlock_wrlock(&store->rwlock);
    int64_t now_ms = get_server_now_ms();
    int res = -1;

    for (size_t i = 0; i < store->room_count; i++) {
        exam_room_t *room = &store->rooms[i];
        if (strcmp(room->room_code, room_code) == 0) {
            // Cho phép dung sai trễ mạng ROOM_SUBMIT_GRACE_MS (2000ms) cho gói tin auto-submit
            // gửi đi sát giây cuối cùng trước khi từ chối bài nộp.
            if (room->status == ROOM_STATUS_ENDED ||
                (room->ends_at_ms > 0 &&
                 now_ms > room->ends_at_ms + ROOM_SUBMIT_GRACE_MS)) {
                lazy_evaluate_room_locked(room, now_ms);
                if (out_room) {
                    *out_room = *room;
                }
                res = -2;
                break;
            }

            if (room->status != ROOM_STATUS_RUNNING) {
                if (out_room) {
                    *out_room = *room;
                }
                res = -3;
                break;
            }

            int found_idx = -1;
            for (size_t j = 0; j < room->participant_count; j++) {
                if (strcmp(room->participants[j], username) == 0) {
                    found_idx = (int)j;
                    break;
                }
            }
            if (found_idx == -1 && room->participant_count < MAX_ROOM_PARTICIPANTS) {
                found_idx = (int)room->participant_count++;
                strncpy(room->participants[found_idx],
                        username,
                        sizeof(room->participants[0]) - 1);
            }
            if (found_idx >= 0) {
                room->scores[found_idx] = score;
                room->submitted[found_idx] = true;
            }

            // Sau khi đã ghi nhận điểm trong cửa sổ Grace Period, cập nhật trạng thái phòng
            lazy_evaluate_room_locked(room, now_ms);
            if (out_room) {
                *out_room = *room;
            }
            res = 0;
            break;
        }
    }

    pthread_rwlock_unlock(&store->rwlock);
    return res;
}

int store_finish_room(in_memory_store_t *store,
                      const char *room_code,
                     exam_room_t *out_room) {
    if (!store || !room_code) {
        return -1;
    }
    pthread_rwlock_wrlock(&store->rwlock);
    int64_t now_ms = get_server_now_ms();
    int res = -1;

    for (size_t i = 0; i < store->room_count; i++) {
        exam_room_t *room = &store->rooms[i];
        if (strcmp(room->room_code, room_code) == 0) {
            room->status = ROOM_STATUS_ENDED;
            room->ended_at_ms = now_ms;
            for (size_t j = 0; j < room->participant_count; j++) {
                room->submitted[j] = true;
            }
            if (out_room) {
                *out_room = *room;
            }
            res = 0;
            break;
        }
    }

    pthread_rwlock_unlock(&store->rwlock);
    return res;
}
