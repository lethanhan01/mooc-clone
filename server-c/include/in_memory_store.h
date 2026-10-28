#ifndef IN_MEMORY_STORE_H
#define IN_MEMORY_STORE_H

#include <pthread.h>
#include <stdbool.h>
#include <time.h>
#include <stddef.h>

#define MAX_EXAMS 256
#define MAX_QUESTIONS 1024

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
    exam_entity_t exams[MAX_EXAMS];
    size_t exam_count;
    question_entity_t questions[MAX_QUESTIONS];
    size_t question_count;
    pthread_rwlock_t rwlock;
} in_memory_store_t;

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

#endif // IN_MEMORY_STORE_H
