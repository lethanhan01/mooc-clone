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
    strncpy(new_exam.title,
            title_item->valuestring,
            sizeof(new_exam.title) - 1);

    cJSON *desc_item = cJSON_GetObjectItemCaseSensitive(json, "description");
    if (cJSON_IsString(desc_item) && desc_item->valuestring != NULL) {
        strncpy(new_exam.description,
                desc_item->valuestring,
                sizeof(new_exam.description) - 1);
    }

    cJSON *dur_item = cJSON_GetObjectItemCaseSensitive(json, "duration_minutes");
    if (cJSON_IsNumber(dur_item)) {
        new_exam.duration_minutes = dur_item->valueint;
    } else {
        new_exam.duration_minutes = DEFAULT_EXAM_DURATION_MIN;
    }

    char created_id[MAX_ID_LEN] = {0};
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
        strncpy(update_data.description,
                desc->valuestring,
                sizeof(update_data.description) - 1);
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
        cJSON *question_obj = cJSON_CreateObject();
        cJSON_AddStringToObject(question_obj, "id", questions[i].id);
        cJSON_AddStringToObject(question_obj, "exam_id", questions[i].exam_id);
        cJSON_AddStringToObject(question_obj, "content", questions[i].content);
        cJSON *opts = cJSON_CreateArray();
        for (int j = 0; j < QUESTION_OPTION_COUNT; j++) {
            cJSON_AddItemToArray(opts, cJSON_CreateString(questions[i].options[j]));
        }
        cJSON_AddItemToObject(question_obj, "options", opts);
        cJSON_AddNumberToObject(question_obj,
                                "correct_option",
                                questions[i].correct_option);
        cJSON_AddItemToArray(arr, question_obj);
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

    question_entity_t new_question;
    memset(&new_question, 0, sizeof(new_question));
    strncpy(new_question.exam_id, id, sizeof(new_question.exam_id) - 1);
    strncpy(new_question.content,
            content->valuestring,
            sizeof(new_question.content) - 1);

    cJSON *opts = cJSON_GetObjectItemCaseSensitive(json, "options");
    if (cJSON_IsArray(opts)) {
        int opt_idx = 0;
        cJSON *elem = NULL;
        cJSON_ArrayForEach(elem, opts) {
            if (opt_idx < QUESTION_OPTION_COUNT &&
                cJSON_IsString(elem) &&
                elem->valuestring) {
                strncpy(new_question.options[opt_idx],
                        elem->valuestring,
                        sizeof(new_question.options[0]) - 1);
                opt_idx++;
            }
        }
    }

    cJSON *correct = cJSON_GetObjectItemCaseSensitive(json, "correct_option");
    if (cJSON_IsNumber(correct)) {
        new_question.correct_option = correct->valueint;
    }

    char created_id[MAX_ID_LEN] = {0};
    if (store_create_question(g_store,
                              &new_question,
                              created_id,
                              sizeof(created_id)) != 0) {
        cJSON_Delete(json);
        http_response_init(res, HTTP_STATUS_NOT_FOUND);
        http_response_set_body_json(
            res,
            "{\"error\":\"Exam not found to attach question\"}");
        return;
    }

    cJSON_Delete(json);

    http_response_init(res, HTTP_STATUS_CREATED);
    cJSON *resp_obj = cJSON_CreateObject();
    cJSON_AddStringToObject(resp_obj, "id", created_id);
    cJSON_AddStringToObject(resp_obj, "exam_id", new_question.exam_id);
    cJSON_AddStringToObject(resp_obj, "content", new_question.content);

    char *json_str = cJSON_PrintUnformatted(resp_obj);
    http_response_set_body_json(res, json_str);

    free(json_str);
    cJSON_Delete(resp_obj);
}

/**
 * @brief Chuyển đổi cấu trúc exam_room_t sang đối tượng JSON kèm đồng hồ chuẩn server_now_ms.
 *
 * Việc đính kèm server_now_ms và ends_at_ms giúp Client tính độ lệch đồng hồ (clock_offset)
 * và hiển thị bộ đếm ngược chính xác qua HTTP Short Polling mà không cần WebSocket.
 *
 * @param[in] room          Con trỏ tới thực thể phòng thi.
 * @param[in] server_now_ms Mốc thời gian chuẩn hiện tại của máy chủ (ms).
 * @return cJSON* Đối tượng JSON biểu diễn trạng thái phòng thi (người gọi cJSON_Delete()).
 */
static cJSON *room_to_cjson(const exam_room_t *room, int64_t server_now_ms) {
    cJSON *obj = cJSON_CreateObject();
    cJSON_AddStringToObject(obj, "id", room->id);
    cJSON_AddStringToObject(obj, "room_code", room->room_code);
    cJSON_AddStringToObject(obj, "name", room->name);
    cJSON_AddStringToObject(obj, "exam_id", room->exam_id);
    cJSON_AddStringToObject(obj, "status", room_status_str(room->status));
    cJSON_AddNumberToObject(obj, "duration_seconds", room->duration_seconds);
    cJSON_AddNumberToObject(obj, "server_now_ms", (double)server_now_ms);
    cJSON_AddNumberToObject(obj, "started_at_ms", (double)room->started_at_ms);
    cJSON_AddNumberToObject(obj, "ends_at_ms", (double)room->ends_at_ms);
    cJSON_AddNumberToObject(obj, "ended_at_ms", (double)room->ended_at_ms);

    int remaining_sec = room->duration_seconds;
    if (room->status == ROOM_STATUS_RUNNING && room->ends_at_ms > 0) {
        int64_t diff_ms = room->ends_at_ms - server_now_ms;
        remaining_sec = diff_ms > 0 ? (int)(diff_ms / MS_PER_SECOND) : 0;
    } else if (room->status == ROOM_STATUS_ENDED) {
        remaining_sec = 0;
    }
    cJSON_AddNumberToObject(obj, "remaining_seconds", remaining_sec);

    cJSON *participants = cJSON_CreateArray();
    for (size_t i = 0; i < room->participant_count; i++) {
        cJSON *p_obj = cJSON_CreateObject();
        cJSON_AddStringToObject(p_obj, "username", room->participants[i]);
        cJSON_AddNumberToObject(p_obj, "score", room->scores[i]);
        cJSON_AddBoolToObject(p_obj, "submitted", room->submitted[i]);
        cJSON_AddItemToArray(participants, p_obj);
    }
    cJSON_AddItemToObject(obj, "participants", participants);
    cJSON_AddNumberToObject(obj, "participant_count", (double)room->participant_count);
    return obj;
}

void handle_get_all_rooms(const http_request_t *req, http_response_t *res) {
    (void)req;
    if (!g_store) {
        http_response_init(res, HTTP_STATUS_INTERNAL_ERROR);
        return;
    }

    exam_room_t rooms[MAX_ROOMS];
    int count = store_get_all_rooms(g_store, rooms, MAX_ROOMS);
    int64_t now_ms = get_server_now_ms();

    http_response_init(res, HTTP_STATUS_OK);
    cJSON *arr = cJSON_CreateArray();
    for (int i = 0; i < count; i++) {
        cJSON_AddItemToArray(arr, room_to_cjson(&rooms[i], now_ms));
    }

    char *json_str = cJSON_PrintUnformatted(arr);
    http_response_set_body_json(res, json_str);
    free(json_str);
    cJSON_Delete(arr);
}

void handle_create_room(const http_request_t *req, http_response_t *res) {
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

    cJSON *code_item = cJSON_GetObjectItemCaseSensitive(json, "room_code");
    if (!cJSON_IsString(code_item) ||
        !code_item->valuestring ||
        code_item->valuestring[0] == '\0') {
        cJSON_Delete(json);
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(res, "{\"error\":\"Field 'room_code' is required\"}");
        return;
    }

    exam_room_t input_room;
    memset(&input_room, 0, sizeof(input_room));
    strncpy(input_room.room_code,
            code_item->valuestring,
            sizeof(input_room.room_code) - 1);

    cJSON *name_item = cJSON_GetObjectItemCaseSensitive(json, "name");
    if (cJSON_IsString(name_item) && name_item->valuestring) {
        strncpy(input_room.name, name_item->valuestring, sizeof(input_room.name) - 1);
    }

    cJSON *exam_item = cJSON_GetObjectItemCaseSensitive(json, "exam_id");
    if (cJSON_IsString(exam_item) && exam_item->valuestring) {
        strncpy(input_room.exam_id,
                exam_item->valuestring,
                sizeof(input_room.exam_id) - 1);
    }

    cJSON *dur_item = cJSON_GetObjectItemCaseSensitive(json, "duration_seconds");
    if (cJSON_IsNumber(dur_item) && dur_item->valueint > 0) {
        input_room.duration_seconds = dur_item->valueint;
    } else {
        input_room.duration_seconds = DEFAULT_ROOM_DURATION_SEC;
    }

    exam_room_t created_room;
    int rc = store_create_room(g_store, &input_room, &created_room);
    cJSON_Delete(json);

    if (rc == -2) {
        http_response_init(res, HTTP_STATUS_CONFLICT);
        http_response_set_body_json(
            res,
            "{\"error\":\"Room code already exists\",\"code\":\"ROOM_CODE_EXISTS\"}");
        return;
    }
    if (rc != 0) {
        http_response_init(res, HTTP_STATUS_INTERNAL_ERROR);
        http_response_set_body_json(res, "{\"error\":\"Failed to create room\"}");
        return;
    }

    http_response_init(res, HTTP_STATUS_CREATED);
    cJSON *resp_obj = room_to_cjson(&created_room, get_server_now_ms());
    char *json_str = cJSON_PrintUnformatted(resp_obj);
    http_response_set_body_json(res, json_str);
    free(json_str);
    cJSON_Delete(resp_obj);
}

void handle_get_room_state(const http_request_t *req, http_response_t *res) {
    if (!g_store) {
        http_response_init(res, HTTP_STATUS_INTERNAL_ERROR);
        return;
    }

    const char *code = http_request_get_param(req, "code");
    if (!code) {
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(res, "{\"error\":\"Missing code parameter\"}");
        return;
    }

    exam_room_t room;
    if (store_get_room_by_code(g_store, code, &room) != 0) {
        http_response_init(res, HTTP_STATUS_NOT_FOUND);
        http_response_set_body_json(res, "{\"error\":\"Room not found\"}");
        return;
    }

    http_response_init(res, HTTP_STATUS_OK);
    cJSON *resp_obj = room_to_cjson(&room, get_server_now_ms());
    char *json_str = cJSON_PrintUnformatted(resp_obj);
    http_response_set_body_json(res, json_str);
    free(json_str);
    cJSON_Delete(resp_obj);
}

void handle_join_room(const http_request_t *req, http_response_t *res) {
    if (!g_store) {
        http_response_init(res, HTTP_STATUS_INTERNAL_ERROR);
        return;
    }

    const char *code = http_request_get_param(req, "code");
    if (!code) {
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(res, "{\"error\":\"Missing code parameter\"}");
        return;
    }

    cJSON *json = req->body ? cJSON_Parse(req->body) : NULL;
    const char *username = "guest";
    if (json) {
        cJSON *username_item = cJSON_GetObjectItemCaseSensitive(json, "username");
        if (cJSON_IsString(username_item) &&
            username_item->valuestring &&
            username_item->valuestring[0] != '\0') {
            username = username_item->valuestring;
        }
    }

    exam_room_t room;
    int rc = store_join_room(g_store, code, username, &room);
    if (json) {
        cJSON_Delete(json);
    }

    if (rc == -2) {
        http_response_init(res, HTTP_STATUS_CONFLICT);
        http_response_set_body_json(
            res,
            "{\"error\":\"Room already ended\",\"code\":\"ROOM_ALREADY_ENDED\"}");
        return;
    }
    if (rc != 0) {
        http_response_init(res, HTTP_STATUS_NOT_FOUND);
        http_response_set_body_json(res, "{\"error\":\"Room not found\"}");
        return;
    }

    http_response_init(res, HTTP_STATUS_OK);
    cJSON *resp_obj = room_to_cjson(&room, get_server_now_ms());
    char *json_str = cJSON_PrintUnformatted(resp_obj);
    http_response_set_body_json(res, json_str);
    free(json_str);
    cJSON_Delete(resp_obj);
}

void handle_start_room(const http_request_t *req, http_response_t *res) {
    if (!g_store) {
        http_response_init(res, HTTP_STATUS_INTERNAL_ERROR);
        return;
    }

    const char *code = http_request_get_param(req, "code");
    if (!code) {
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(res, "{\"error\":\"Missing code parameter\"}");
        return;
    }

    exam_room_t room;
    if (store_start_room(g_store, code, &room) != 0) {
        http_response_init(res, HTTP_STATUS_NOT_FOUND);
        http_response_set_body_json(res, "{\"error\":\"Room not found\"}");
        return;
    }

    http_response_init(res, HTTP_STATUS_OK);
    cJSON *resp_obj = room_to_cjson(&room, get_server_now_ms());
    char *json_str = cJSON_PrintUnformatted(resp_obj);
    http_response_set_body_json(res, json_str);
    free(json_str);
    cJSON_Delete(resp_obj);
}

void handle_submit_room_attempt(const http_request_t *req, http_response_t *res) {
    if (!g_store) {
        http_response_init(res, HTTP_STATUS_INTERNAL_ERROR);
        return;
    }

    const char *code = http_request_get_param(req, "code");
    if (!code) {
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(res, "{\"error\":\"Missing code parameter\"}");
        return;
    }

    cJSON *json = req->body ? cJSON_Parse(req->body) : NULL;
    if (!json) {
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(res, "{\"error\":\"Invalid JSON payload\"}");
        return;
    }

    cJSON *username_item = cJSON_GetObjectItemCaseSensitive(json, "username");
    const char *username =
        (cJSON_IsString(username_item) && username_item->valuestring)
            ? username_item->valuestring
            : "guest";

    cJSON *score_item = cJSON_GetObjectItemCaseSensitive(json, "score");
    int score = cJSON_IsNumber(score_item) ? score_item->valueint : 0;

    exam_room_t room;
    int rc = store_submit_room_attempt(g_store, code, username, score, &room);
    cJSON_Delete(json);

    if (rc == -2) {
        http_response_init(res, HTTP_STATUS_CONFLICT);
        http_response_set_body_json(
            res,
            "{\"error\":\"Exam deadline exceeded\",\"code\":\"ROOM_ALREADY_ENDED\"}");
        return;
    }
    if (rc == -3) {
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(
            res,
            "{\"error\":\"Room is not running\",\"code\":\"ROOM_NOT_RUNNING\"}");
        return;
    }
    if (rc != 0) {
        http_response_init(res, HTTP_STATUS_NOT_FOUND);
        http_response_set_body_json(res, "{\"error\":\"Room not found\"}");
        return;
    }

    http_response_init(res, HTTP_STATUS_OK);
    cJSON *resp_obj = room_to_cjson(&room, get_server_now_ms());
    char *json_str = cJSON_PrintUnformatted(resp_obj);
    http_response_set_body_json(res, json_str);
    free(json_str);
    cJSON_Delete(resp_obj);
}

void handle_finish_room(const http_request_t *req, http_response_t *res) {
    if (!g_store) {
        http_response_init(res, HTTP_STATUS_INTERNAL_ERROR);
        return;
    }

    const char *code = http_request_get_param(req, "code");
    if (!code) {
        http_response_init(res, HTTP_STATUS_BAD_REQUEST);
        http_response_set_body_json(res, "{\"error\":\"Missing code parameter\"}");
        return;
    }

    exam_room_t room;
    if (store_finish_room(g_store, code, &room) != 0) {
        http_response_init(res, HTTP_STATUS_NOT_FOUND);
        http_response_set_body_json(res, "{\"error\":\"Room not found\"}");
        return;
    }

    http_response_init(res, HTTP_STATUS_OK);
    cJSON *resp_obj = room_to_cjson(&room, get_server_now_ms());
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
    http_router_register(router,
                         HTTP_METHOD_GET,
                         "/api/v1/exams/:id",
                         handle_get_exam_by_id);
    http_router_register(router,
                         HTTP_METHOD_PUT,
                         "/api/v1/exams/:id",
                         handle_update_exam);
    http_router_register(router,
                         HTTP_METHOD_DELETE,
                         "/api/v1/exams/:id",
                         handle_delete_exam);
    http_router_register(router,
                         HTTP_METHOD_GET,
                         "/api/v1/exams/:id/questions",
                         handle_get_exam_questions);
    http_router_register(router,
                         HTTP_METHOD_POST,
                         "/api/v1/exams/:id/questions",
                         handle_create_question);

    // Các tuyến đường phòng thi trực tuyến theo mô hình Stateless HTTP Short Polling
    http_router_register(router, HTTP_METHOD_GET, "/api/v1/rooms", handle_get_all_rooms);
    http_router_register(router, HTTP_METHOD_POST, "/api/v1/rooms", handle_create_room);
    http_router_register(router,
                         HTTP_METHOD_GET,
                         "/api/v1/rooms/:code/state",
                         handle_get_room_state);
    http_router_register(router,
                         HTTP_METHOD_POST,
                         "/api/v1/rooms/:code/join",
                         handle_join_room);
    http_router_register(router,
                         HTTP_METHOD_POST,
                         "/api/v1/rooms/:code/start",
                         handle_start_room);
    http_router_register(router,
                         HTTP_METHOD_POST,
                         "/api/v1/rooms/:code/submit",
                         handle_submit_room_attempt);
    http_router_register(router,
                         HTTP_METHOD_POST,
                         "/api/v1/rooms/:code/finish",
                         handle_finish_room);
}
