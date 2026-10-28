#ifndef REST_CONTROLLERS_H
#define REST_CONTROLLERS_H

#include "http_router.h"
#include "in_memory_store.h"

#define DEFAULT_EXAM_DURATION_MIN 45

/**
 * @brief Liên kết kho lưu trữ dữ liệu trên RAM với tầng REST Controllers.
 *
 * @param[in] store Con trỏ tới thực thể in_memory_store_t.
 */
void controllers_init(in_memory_store_t *store);

/**
 * @brief Xử lý GET /api/v1/health — Kiểm tra tình trạng hoạt động của máy chủ.
 *
 * @param[in]  req Con trỏ tới HTTP request.
 * @param[out] res Con trỏ tới HTTP response.
 */
void handle_health(const http_request_t *req, http_response_t *res);

/**
 * @brief Xử lý GET /api/v1/exams — Lấy danh sách toàn bộ các đề thi.
 *
 * @param[in]  req Con trỏ tới HTTP request.
 * @param[out] res Con trỏ tới HTTP response.
 */
void handle_get_all_exams(const http_request_t *req, http_response_t *res);

/**
 * @brief Xử lý POST /api/v1/exams — Tạo mới một đề thi từ JSON body.
 *
 * @param[in]  req Con trỏ tới HTTP request.
 * @param[out] res Con trỏ tới HTTP response.
 */
void handle_create_exam(const http_request_t *req, http_response_t *res);

/**
 * @brief Xử lý GET /api/v1/exams/:id — Xem chi tiết một đề thi theo ID.
 *
 * @param[in]  req Con trỏ tới HTTP request.
 * @param[out] res Con trỏ tới HTTP response.
 */
void handle_get_exam_by_id(const http_request_t *req, http_response_t *res);

/**
 * @brief Xử lý PUT /api/v1/exams/:id — Cập nhật thông tin một đề thi.
 *
 * @param[in]  req Con trỏ tới HTTP request.
 * @param[out] res Con trỏ tới HTTP response.
 */
void handle_update_exam(const http_request_t *req, http_response_t *res);

/**
 * @brief Xử lý DELETE /api/v1/exams/:id — Xóa một đề thi và các câu hỏi liên quan.
 *
 * @param[in]  req Con trỏ tới HTTP request.
 * @param[out] res Con trỏ tới HTTP response.
 */
void handle_delete_exam(const http_request_t *req, http_response_t *res);

/**
 * @brief Xử lý GET /api/v1/exams/:id/questions — Lấy danh sách câu hỏi của đề thi.
 *
 * @param[in]  req Con trỏ tới HTTP request.
 * @param[out] res Con trỏ tới HTTP response.
 */
void handle_get_exam_questions(const http_request_t *req, http_response_t *res);

/**
 * @brief Xử lý POST /api/v1/exams/:id/questions — Thêm câu hỏi mới vào đề thi.
 *
 * @param[in]  req Con trỏ tới HTTP request.
 * @param[out] res Con trỏ tới HTTP response.
 */
void handle_create_question(const http_request_t *req, http_response_t *res);

/**
 * @brief Xử lý GET /api/v1/rooms — Lấy danh sách toàn bộ phòng thi trực tuyến.
 *
 * @param[in]  req Con trỏ tới HTTP request.
 * @param[out] res Con trỏ tới HTTP response.
 */
void handle_get_all_rooms(const http_request_t *req, http_response_t *res);

/**
 * @brief Xử lý POST /api/v1/rooms — Tạo phòng thi mới ở trạng thái WAITING.
 *
 * @param[in]  req Con trỏ tới HTTP request.
 * @param[out] res Con trỏ tới HTTP response.
 */
void handle_create_room(const http_request_t *req, http_response_t *res);

/**
 * @brief Xử lý GET /api/v1/rooms/:code/state — Short Polling trạng thái & đồng hồ phòng thi.
 *
 * @param[in]  req Con trỏ tới HTTP request.
 * @param[out] res Con trỏ tới HTTP response.
 */
void handle_get_room_state(const http_request_t *req, http_response_t *res);

/**
 * @brief Xử lý POST /api/v1/rooms/:code/join — Đăng ký thí sinh vào phòng thi.
 *
 * @param[in]  req Con trỏ tới HTTP request.
 * @param[out] res Con trỏ tới HTTP response.
 */
void handle_join_room(const http_request_t *req, http_response_t *res);

/**
 * @brief Xử lý POST /api/v1/rooms/:code/start — Kích hoạt phòng thi sang trạng thái RUNNING.
 *
 * @param[in]  req Con trỏ tới HTTP request.
 * @param[out] res Con trỏ tới HTTP response.
 */
void handle_start_room(const http_request_t *req, http_response_t *res);

/**
 * @brief Xử lý POST /api/v1/rooms/:code/submit — Ghi nhận kết quả nộp bài của thí sinh.
 *
 * @param[in]  req Con trỏ tới HTTP request.
 * @param[out] res Con trỏ tới HTTP response.
 */
void handle_submit_room_attempt(const http_request_t *req, http_response_t *res);

/**
 * @brief Xử lý POST /api/v1/rooms/:code/finish — Đóng phòng thi thủ công ngay lập tức.
 *
 * @param[in]  req Con trỏ tới HTTP request.
 * @param[out] res Con trỏ tới HTTP response.
 */
void handle_finish_room(const http_request_t *req, http_response_t *res);

/**
 * @brief Đăng ký toàn bộ các tuyến đường REST API vào bộ định tuyến HTTP.
 *
 * @param[in,out] router Con trỏ tới bộ định tuyến HTTP.
 * @param[in]     store  Con trỏ tới kho lưu trữ dữ liệu trên RAM.
 */
void register_all_routes(http_router_t *router, in_memory_store_t *store);

#endif // REST_CONTROLLERS_H
