#ifndef IN_MEMORY_STORE_H
#define IN_MEMORY_STORE_H

#include <pthread.h>
#include <stdbool.h>
#include <stdint.h>
#include <time.h>
#include <stddef.h>

#define MAX_EXAMS 256
#define MAX_QUESTIONS 1024
#define MAX_ROOMS 64
#define MAX_ROOM_PARTICIPANTS 32
#define ROOM_SUBMIT_GRACE_MS 2000

typedef enum {
    ROOM_STATUS_WAITING = 0,
    ROOM_STATUS_RUNNING = 1,
    ROOM_STATUS_ENDED = 2
} room_status_t;

typedef struct {
    char id[36];
    char title[128];
    char description[256];
    int duration_minutes;
    int question_count;
    time_t created_at;
} exam_entity_t;

typedef struct {
    char id[36];
    char exam_id[36];
    char content[512];
    char options[4][128];
    int correct_option;
} question_entity_t;

typedef struct {
    char id[36];
    char room_code[16];
    char name[128];
    char exam_id[36];
    room_status_t status;
    int duration_seconds;
    int64_t started_at_ms;
    int64_t ends_at_ms;
    int64_t ended_at_ms;
    char participants[MAX_ROOM_PARTICIPANTS][64];
    int scores[MAX_ROOM_PARTICIPANTS];
    bool submitted[MAX_ROOM_PARTICIPANTS];
    size_t participant_count;
} exam_room_t;

typedef struct {
    exam_entity_t exams[MAX_EXAMS];
    size_t exam_count;
    question_entity_t questions[MAX_QUESTIONS];
    size_t question_count;
    exam_room_t rooms[MAX_ROOMS];
    size_t room_count;
    pthread_rwlock_t rwlock;
} in_memory_store_t;

int64_t get_server_now_ms(void);
const char *room_status_str(room_status_t status);

void store_init(in_memory_store_t *store);
void store_destroy(in_memory_store_t *store);

// CRUD Exams API
int store_get_all_exams(in_memory_store_t *store, exam_entity_t *out_exams, size_t max_out);
int store_get_exam_by_id(in_memory_store_t *store, const char *id, exam_entity_t *out_exam);
int store_create_exam(in_memory_store_t *store, const exam_entity_t *exam, char *out_id, size_t id_len);
int store_update_exam(in_memory_store_t *store, const char *id, const exam_entity_t *exam);
int store_delete_exam(in_memory_store_t *store, const char *id);

// CRUD Questions API
int store_get_questions_by_exam_id(in_memory_store_t *store, const char *exam_id, question_entity_t *out_questions, size_t max_out);
int store_create_question(in_memory_store_t *store, const question_entity_t *question, char *out_id, size_t id_len);

// Stateless REST Polling Exam Rooms API (Server Authoritative Timestamp + Lazy Expiration)
int store_get_all_rooms(in_memory_store_t *store, exam_room_t *out_rooms, size_t max_out);
int store_get_room_by_code(in_memory_store_t *store, const char *room_code, exam_room_t *out_room);
int store_create_room(in_memory_store_t *store, const exam_room_t *room, exam_room_t *out_room);
int store_join_room(in_memory_store_t *store, const char *room_code, const char *username, exam_room_t *out_room);
int store_start_room(in_memory_store_t *store, const char *room_code, exam_room_t *out_room);
int store_submit_room_attempt(in_memory_store_t *store, const char *room_code, const char *username, int score, exam_room_t *out_room);
int store_finish_room(in_memory_store_t *store, const char *room_code, exam_room_t *out_room);

#endif // IN_MEMORY_STORE_H
