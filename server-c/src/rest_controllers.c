#include "rest_controllers.h"
#include "http_parser.h"
#include "cJSON.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static in_memory_store_t *g_store = NULL;

void controllers_init(in_memory_store_t *store) {
    g_store = store;
}

void handle_health(const http_request_t *req, http_response_t *res) {
    (void)req;
    http_response_init(res, HTTP_STATUS_OK);

    cJSON *root = cJSON_CreateObject();
    cJSON_AddStringToObject(root, "status", "UP");
    cJSON_AddStringToObject(root, "engine", "Doug Lea Classic C Reactor");
    cJSON_AddStringToObject(root, "version", "1.0.0");

    char *json_str = cJSON_PrintUnformatted(root);
    http_response_set_body_json(res, json_str);

    free(json_str);
    cJSON_Delete(root);
}

void handle_get_all_exams(const http_request_t *req, http_response_t *res) {
    (void)req;
    if (!g_store) {
        http_response_init(res, HTTP_STATUS_INTERNAL_ERROR);
        return;
    }

    exam_entity_t exams[MAX_EXAMS];
    int count = store_get_all_exams(g_store, exams, MAX_EXAMS);

    http_response_init(res, HTTP_STATUS_OK);
    cJSON *arr = cJSON_CreateArray();

    for (int i = 0; i < count; i++) {
        cJSON *item = cJSON_CreateObject();
        cJSON_AddStringToObject(item, "id", exams[i].id);
        cJSON_AddStringToObject(item, "title", exams[i].title);
        cJSON_AddStringToObject(item, "description", exams[i].description);
        cJSON_AddNumberToObject(item, "duration_minutes", exams[i].duration_minutes);
        cJSON_AddNumberToObject(item, "question_count", exams[i].question_count);
        cJSON_AddItemToArray(arr, item);
    }

    char *json_str = cJSON_PrintUnformatted(arr);
    http_response_set_body_json(res, json_str);

    free(json_str);
    cJSON_Delete(arr);
}

void handle_create_exam(const http_request_t *req, http_response_t *res) {
    if (!g_store) {
        http_response_init(res, HTTP_STATUS_INTERNAL_ERROR);
        return;
    }

    if (!req->body || req->body_len == 0) {
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(res, "{\"error\":\"Missing JSON body\"}");
        return;
    }

    cJSON *json = cJSON_Parse(req->body);
    if (!json) {
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(res, "{\"error\":\"Invalid JSON payload\"}");
        return;
    }

    cJSON *title_item = cJSON_GetObjectItemCaseSensitive(json, "title");
    if (!cJSON_IsString(title_item) || (title_item->valuestring == NULL)) {
        cJSON_Delete(json);
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(res, "{\"error\":\"Field 'title' is required\"}");
        return;
    }

    exam_entity_t new_exam;
    memset(&new_exam, 0, sizeof(new_exam));
    strncpy(new_exam.title, title_item->valuestring, sizeof(new_exam.title) - 1);

    cJSON *desc_item = cJSON_GetObjectItemCaseSensitive(json, "description");
    if (cJSON_IsString(desc_item) && desc_item->valuestring != NULL) {
        strncpy(new_exam.description, desc_item->valuestring, sizeof(new_exam.description) - 1);
    }

    cJSON *dur_item = cJSON_GetObjectItemCaseSensitive(json, "duration_minutes");
    if (cJSON_IsNumber(dur_item)) {
        new_exam.duration_minutes = dur_item->valueint;
    } else {
        new_exam.duration_minutes = 45;
    }

    char created_id[36] = {0};
    if (store_create_exam(g_store, &new_exam, created_id, sizeof(created_id)) != 0) {
        cJSON_Delete(json);
        http_response_init(res, HTTP_STATUS_INTERNAL_ERROR);
        http_response_set_body_json(res, "{\"error\":\"Failed to persist exam\"}");
        return;
    }

    cJSON_Delete(json);

    http_response_init(res, HTTP_STATUS_CREATED);
    cJSON *resp_obj = cJSON_CreateObject();
    cJSON_AddStringToObject(resp_obj, "id", created_id);
    cJSON_AddStringToObject(resp_obj, "title", new_exam.title);
    cJSON_AddStringToObject(resp_obj, "description", new_exam.description);
    cJSON_AddNumberToObject(resp_obj, "duration_minutes", new_exam.duration_minutes);

    char *json_str = cJSON_PrintUnformatted(resp_obj);
    http_response_set_body_json(res, json_str);

    free(json_str);
    cJSON_Delete(resp_obj);
}

void handle_get_exam_by_id(const http_request_t *req, http_response_t *res) {
    if (!g_store) {
        http_response_init(res, HTTP_STATUS_INTERNAL_ERROR);
        return;
    }

    const char *id = http_request_get_param(req, "id");
    if (!id) {
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(res, "{\"error\":\"Missing id parameter\"}");
        return;
    }

    exam_entity_t exam;
    if (store_get_exam_by_id(g_store, id, &exam) != 0) {
        http_response_init(res, HTTP_STATUS_NOT_FOUND);
        http_response_set_body_json(res, "{\"error\":\"Exam not found\"}");
        return;
    }

    http_response_init(res, HTTP_STATUS_OK);
    cJSON *item = cJSON_CreateObject();
    cJSON_AddStringToObject(item, "id", exam.id);
    cJSON_AddStringToObject(item, "title", exam.title);
    cJSON_AddStringToObject(item, "description", exam.description);
    cJSON_AddNumberToObject(item, "duration_minutes", exam.duration_minutes);
    cJSON_AddNumberToObject(item, "question_count", exam.question_count);

    char *json_str = cJSON_PrintUnformatted(item);
    http_response_set_body_json(res, json_str);

    free(json_str);
    cJSON_Delete(item);
}

void handle_update_exam(const http_request_t *req, http_response_t *res) {
    if (!g_store) {
        http_response_init(res, HTTP_STATUS_INTERNAL_ERROR);
        return;
    }

    const char *id = http_request_get_param(req, "id");
    if (!id) {
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(res, "{\"error\":\"Missing id parameter\"}");
        return;
    }

    cJSON *json = cJSON_Parse(req->body);
    if (!json) {
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(res, "{\"error\":\"Invalid JSON payload\"}");
        return;
    }

    exam_entity_t update_data;
    memset(&update_data, 0, sizeof(update_data));

    cJSON *title = cJSON_GetObjectItemCaseSensitive(json, "title");
    if (cJSON_IsString(title) && title->valuestring) {
        strncpy(update_data.title, title->valuestring, sizeof(update_data.title) - 1);
    }

    cJSON *desc = cJSON_GetObjectItemCaseSensitive(json, "description");
    if (cJSON_IsString(desc) && desc->valuestring) {
        strncpy(update_data.description, desc->valuestring, sizeof(update_data.description) - 1);
    }

    cJSON *dur = cJSON_GetObjectItemCaseSensitive(json, "duration_minutes");
    if (cJSON_IsNumber(dur)) {
        update_data.duration_minutes = dur->valueint;
    }

    if (store_update_exam(g_store, id, &update_data) != 0) {
        cJSON_Delete(json);
        http_response_init(res, HTTP_STATUS_NOT_FOUND);
        http_response_set_body_json(res, "{\"error\":\"Exam not found\"}");
        return;
    }

    cJSON_Delete(json);
    http_response_init(res, HTTP_STATUS_OK);
    http_response_set_body_json(res, "{\"message\":\"Exam updated successfully\"}");
}

void handle_delete_exam(const http_request_t *req, http_response_t *res) {
    if (!g_store) {
        http_response_init(res, HTTP_STATUS_INTERNAL_ERROR);
        return;
    }

    const char *id = http_request_get_param(req, "id");
    if (!id) {
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(res, "{\"error\":\"Missing id parameter\"}");
        return;
    }

    if (store_delete_exam(g_store, id) != 0) {
        http_response_init(res, HTTP_STATUS_NOT_FOUND);
        http_response_set_body_json(res, "{\"error\":\"Exam not found\"}");
        return;
    }

    http_response_init(res, HTTP_STATUS_OK);
    http_response_set_body_json(res, "{\"message\":\"Exam deleted successfully\"}");
}

void handle_get_exam_questions(const http_request_t *req, http_response_t *res) {
    if (!g_store) {
        http_response_init(res, HTTP_STATUS_INTERNAL_ERROR);
        return;
    }

    const char *id = http_request_get_param(req, "id");
    if (!id) {
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(res, "{\"error\":\"Missing id parameter\"}");
        return;
    }

    question_entity_t questions[MAX_QUESTIONS];
    int count = store_get_questions_by_exam_id(g_store, id, questions, MAX_QUESTIONS);

    http_response_init(res, HTTP_STATUS_OK);
    cJSON *arr = cJSON_CreateArray();

    for (int i = 0; i < count; i++) {
        cJSON *q = cJSON_CreateObject();
        cJSON_AddStringToObject(q, "id", questions[i].id);
        cJSON_AddStringToObject(q, "exam_id", questions[i].exam_id);
        cJSON_AddStringToObject(q, "content", questions[i].content);
        cJSON *opts = cJSON_CreateArray();
        for (int j = 0; j < 4; j++) {
            cJSON_AddItemToArray(opts, cJSON_CreateString(questions[i].options[j]));
        }
        cJSON_AddItemToObject(q, "options", opts);
        cJSON_AddNumberToObject(q, "correct_option", questions[i].correct_option);
        cJSON_AddItemToArray(arr, q);
    }

    char *json_str = cJSON_PrintUnformatted(arr);
    http_response_set_body_json(res, json_str);

    free(json_str);
    cJSON_Delete(arr);
}

void handle_create_question(const http_request_t *req, http_response_t *res) {
    if (!g_store) {
        http_response_init(res, HTTP_STATUS_INTERNAL_ERROR);
        return;
    }

    const char *id = http_request_get_param(req, "id");
    if (!id) {
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(res, "{\"error\":\"Missing id parameter\"}");
        return;
    }

    cJSON *json = cJSON_Parse(req->body);
    if (!json) {
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(res, "{\"error\":\"Invalid JSON payload\"}");
        return;
    }

    cJSON *content = cJSON_GetObjectItemCaseSensitive(json, "content");
    if (!cJSON_IsString(content) || !content->valuestring) {
        cJSON_Delete(json);
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(res, "{\"error\":\"Field 'content' is required\"}");
        return;
    }

    question_entity_t new_q;
    memset(&new_q, 0, sizeof(new_q));
    strncpy(new_q.exam_id, id, sizeof(new_q.exam_id) - 1);
    strncpy(new_q.content, content->valuestring, sizeof(new_q.content) - 1);

    cJSON *opts = cJSON_GetObjectItemCaseSensitive(json, "options");
    if (cJSON_IsArray(opts)) {
        int opt_idx = 0;
        cJSON *elem = NULL;
        cJSON_ArrayForEach(elem, opts) {
            if (opt_idx < 4 && cJSON_IsString(elem) && elem->valuestring) {
                strncpy(new_q.options[opt_idx], elem->valuestring, sizeof(new_q.options[0]) - 1);
                opt_idx++;
            }
        }
    }

    cJSON *correct = cJSON_GetObjectItemCaseSensitive(json, "correct_option");
    if (cJSON_IsNumber(correct)) {
        new_q.correct_option = correct->valueint;
    }

    char created_id[36] = {0};
    if (store_create_question(g_store, &new_q, created_id, sizeof(created_id)) != 0) {
        cJSON_Delete(json);
        http_response_init(res, HTTP_STATUS_NOT_FOUND);
        http_response_set_body_json(res, "{\"error\":\"Exam not found to attach question\"}");
        return;
    }

    cJSON_Delete(json);

    http_response_init(res, HTTP_STATUS_CREATED);
    cJSON *resp_obj = cJSON_CreateObject();
    cJSON_AddStringToObject(resp_obj, "id", created_id);
    cJSON_AddStringToObject(resp_obj, "exam_id", new_q.exam_id);
    cJSON_AddStringToObject(resp_obj, "content", new_q.content);

    char *json_str = cJSON_PrintUnformatted(resp_obj);
    http_response_set_body_json(res, json_str);

    free(json_str);
    cJSON_Delete(resp_obj);
}

void register_all_routes(http_router_t *router, in_memory_store_t *store) {
    controllers_init(store);

    http_router_register(router, HTTP_METHOD_GET, "/api/v1/health", handle_health);
    http_router_register(router, HTTP_METHOD_GET, "/api/v1/exams", handle_get_all_exams);
    http_router_register(router, HTTP_METHOD_POST, "/api/v1/exams", handle_create_exam);
    http_router_register(router, HTTP_METHOD_GET, "/api/v1/exams/:id", handle_get_exam_by_id);
    http_router_register(router, HTTP_METHOD_PUT, "/api/v1/exams/:id", handle_update_exam);
    http_router_register(router, HTTP_METHOD_DELETE, "/api/v1/exams/:id", handle_delete_exam);
    http_router_register(router, HTTP_METHOD_GET, "/api/v1/exams/:id/questions", handle_get_exam_questions);
    http_router_register(router, HTTP_METHOD_POST, "/api/v1/exams/:id/questions", handle_create_question);
}
