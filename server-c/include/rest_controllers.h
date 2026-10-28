#ifndef REST_CONTROLLERS_H
#define REST_CONTROLLERS_H

#include "http_router.h"
#include "in_memory_store.h"

void controllers_init(in_memory_store_t *store);

void handle_health(const http_request_t *req, http_response_t *res);
void handle_get_all_exams(const http_request_t *req, http_response_t *res);
void handle_create_exam(const http_request_t *req, http_response_t *res);
void handle_get_exam_by_id(const http_request_t *req, http_response_t *res);
void handle_update_exam(const http_request_t *req, http_response_t *res);
void handle_delete_exam(const http_request_t *req, http_response_t *res);
void handle_get_exam_questions(const http_request_t *req, http_response_t *res);
void handle_create_question(const http_request_t *req, http_response_t *res);

// Stateless REST Polling Room Controllers (Server Authoritative Timestamp)
void handle_get_all_rooms(const http_request_t *req, http_response_t *res);
void handle_create_room(const http_request_t *req, http_response_t *res);
void handle_get_room_state(const http_request_t *req, http_response_t *res);
void handle_join_room(const http_request_t *req, http_response_t *res);
void handle_start_room(const http_request_t *req, http_response_t *res);
void handle_submit_room_attempt(const http_request_t *req, http_response_t *res);
void handle_finish_room(const http_request_t *req, http_response_t *res);

void register_all_routes(http_router_t *router, in_memory_store_t *store);

#endif // REST_CONTROLLERS_H
