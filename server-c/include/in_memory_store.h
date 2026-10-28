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

#define MAX_ID_LEN 36
#define MAX_EXAM_TITLE_LEN 128
#define MAX_EXAM_DESC_LEN 256
#define MAX_QUESTION_CONTENT_LEN 512
#define QUESTION_OPTION_COUNT 4
#define MAX_OPTION_TEXT_LEN 128
#define MAX_ROOM_CODE_LEN 16
#define MAX_ROOM_NAME_LEN 128
#define MAX_PARTICIPANT_NAME_LEN 64

#define SEED_EXAM_DURATION_MIN 60
#define DEFAULT_ROOM_DURATION_SEC 900
#define MS_PER_SECOND 1000LL
#define NS_PER_MS 1000000L

/**
 * @brief Trạng thái vòng đời của một phòng thi trực tuyến.
 */
typedef enum {
    ROOM_STATUS_WAITING = 0,
    ROOM_STATUS_RUNNING = 1,
    ROOM_STATUS_ENDED = 2
} room_status_t;

/**
 * @brief Thực thể lưu thông tin một đề thi (Exam Entity).
 */
typedef struct {
    char id[MAX_ID_LEN];
    char title[MAX_EXAM_TITLE_LEN];
    char description[MAX_EXAM_DESC_LEN];
    int duration_minutes;
    int question_count;
    time_t created_at;
} exam_entity_t;

/**
 * @brief Thực thể lưu thông tin một câu hỏi trắc nghiệm 4 lựa chọn.
 */
typedef struct {
    char id[MAX_ID_LEN];
    char exam_id[MAX_ID_LEN];
    char content[MAX_QUESTION_CONTENT_LEN];
    char options[QUESTION_OPTION_COUNT][MAX_OPTION_TEXT_LEN];
    int correct_option;
} question_entity_t;

/**
 * @brief Thực thể lưu trạng thái phòng thi trực tuyến (hỗ trợ HTTP Short Polling).
 */
typedef struct {
    char id[MAX_ID_LEN];
    char room_code[MAX_ROOM_CODE_LEN];
    char name[MAX_ROOM_NAME_LEN];
    char exam_id[MAX_ID_LEN];
    room_status_t status;
    int duration_seconds;
    int64_t started_at_ms;
    int64_t ends_at_ms;
    int64_t ended_at_ms;
    char participants[MAX_ROOM_PARTICIPANTS][MAX_PARTICIPANT_NAME_LEN];
    int scores[MAX_ROOM_PARTICIPANTS];
    bool submitted[MAX_ROOM_PARTICIPANTS];
    size_t participant_count;
} exam_room_t;

/**
 * @brief Kho lưu trữ dữ liệu trên bộ nhớ RAM an toàn đa luồng qua Read-Write Lock.
 */
typedef struct {
    exam_entity_t exams[MAX_EXAMS];
    size_t exam_count;
    question_entity_t questions[MAX_QUESTIONS];
    size_t question_count;
    exam_room_t rooms[MAX_ROOMS];
    size_t room_count;
    pthread_rwlock_t rwlock;
} in_memory_store_t;

/**
 * @brief Lấy mốc thời gian chuẩn của máy chủ (Unix Epoch Milliseconds).
 *
 * @return int64_t Thời gian hiện tại tính bằng mili-giây.
 */
int64_t get_server_now_ms(void);

/**
 * @brief Chuyển đổi giá trị enum room_status_t sang chuỗi trạng thái phòng thi.
 *
 * @param[in] status Trạng thái phòng thi.
 * @return const char* Chuỗi hằng tương ứng ("WAITING", "RUNNING", "ENDED").
 */
const char *room_status_str(room_status_t status);

/**
 * @brief Khởi tạo kho lưu trữ trên RAM, thiết lập rwlock và nạp dữ liệu mẫu ban đầu.
 *
 * @param[out] store Con trỏ tới cấu trúc in_memory_store_t cần khởi tạo.
 */
void store_init(in_memory_store_t *store);

/**
 * @brief Hủy khóa đồng bộ pthread_rwlock_t và giải phóng tài nguyên của kho lưu trữ.
 *
 * @param[in,out] store Con trỏ tới cấu trúc in_memory_store_t.
 */
void store_destroy(in_memory_store_t *store);

/**
 * @brief Lấy danh sách toàn bộ các đề thi hiện có trong kho lưu trữ.
 *
 * @param[in,out] store     Con trỏ tới kho lưu trữ.
 * @param[out]    out_exams Mảng nhận dữ liệu các đề thi.
 * @param[in]     max_out   Số lượng phần tử tối đa mảng out_exams có thể chứa.
 * @return int Số lượng đề thi thực tế đã sao chép vào out_exams.
 */
int store_get_all_exams(in_memory_store_t *store,
                        exam_entity_t *out_exams,
                        size_t max_out);

/**
 * @brief Tìm kiếm thông tin chi tiết một đề thi theo định danh ID.
 *
 * @param[in,out] store    Con trỏ tới kho lưu trữ.
 * @param[in]     id       Chuỗi định danh đề thi (ví dụ "exam-1").
 * @param[out]    out_exam Con trỏ nhận thông tin đề thi nếu tìm thấy.
 * @return int 0 nếu tìm thấy, -1 nếu không tồn tại.
 */
int store_get_exam_by_id(in_memory_store_t *store,
                         const char *id,
                         exam_entity_t *out_exam);

/**
 * @brief Tạo mới một đề thi trong kho lưu trữ và sinh mã ID tự động.
 *
 * @param[in,out] store  Con trỏ tới kho lưu trữ.
 * @param[in]     exam   Con trỏ chứa dữ liệu đề thi đầu vào.
 * @param[out]    out_id Bộ đệm nhận chuỗi ID vừa được cấp phát.
 * @param[in]     id_len Kích thước tối đa của bộ đệm out_id.
 * @return int 0 nếu tạo thành công, -1 nếu kho đầy hoặc tham số không hợp lệ.
 */
int store_create_exam(in_memory_store_t *store,
                      const exam_entity_t *exam,
                      char *out_id,
                      size_t id_len);

/**
 * @brief Cập nhật tiêu đề, mô tả và thời lượng của một đề thi theo ID.
 *
 * @param[in,out] store Con trỏ tới kho lưu trữ.
 * @param[in]     id    Chuỗi định danh đề thi cần cập nhật.
 * @param[in]     exam  Con trỏ chứa thông tin cập nhật mới.
 * @return int 0 nếu cập nhật thành công, -1 nếu không tìm thấy đề thi.
 */
int store_update_exam(in_memory_store_t *store,
                      const char *id,
                      const exam_entity_t *exam);

/**
 * @brief Xóa một đề thi và toàn bộ các câu hỏi phụ thuộc khỏi kho lưu trữ.
 *
 * @param[in,out] store Con trỏ tới kho lưu trữ.
 * @param[in]     id    Chuỗi định danh đề thi cần xóa.
 * @return int 0 nếu xóa thành công, -1 nếu không tìm thấy đề thi.
 */
int store_delete_exam(in_memory_store_t *store, const char *id);

/**
 * @brief Lấy danh sách các câu hỏi trắc nghiệm thuộc về một đề thi.
 *
 * @param[in,out] store         Con trỏ tới kho lưu trữ.
 * @param[in]     exam_id       Mã định danh của đề thi.
 * @param[out]    out_questions Mảng nhận danh sách câu hỏi.
 * @param[in]     max_out       Sức chứa tối đa của mảng out_questions.
 * @return int Số lượng câu hỏi thực tế tìm thấy.
 */
int store_get_questions_by_exam_id(in_memory_store_t *store,
                                   const char *exam_id,
                                   question_entity_t *out_questions,
                                   size_t max_out);

/**
 * @brief Thêm một câu hỏi trắc nghiệm mới vào đề thi chỉ định.
 *
 * @param[in,out] store    Con trỏ tới kho lưu trữ.
 * @param[in]     question Con trỏ chứa thông tin câu hỏi cần thêm.
 * @param[out]    out_id   Bộ đệm nhận chuỗi ID của câu hỏi mới.
 * @param[in]     id_len   Kích thước bộ đệm out_id.
 * @return int 0 nếu thành công, -1 nếu đề thi không tồn tại hoặc kho câu hỏi đã đầy.
 */
int store_create_question(in_memory_store_t *store,
                          const question_entity_t *question,
                          char *out_id,
                          size_t id_len);

/**
 * @brief Lấy danh sách toàn bộ phòng thi kèm đánh giá hết hạn lười (Lazy Expiration).
 *
 * @param[in,out] store     Con trỏ tới kho lưu trữ.
 * @param[out]    out_rooms Mảng nhận danh sách phòng thi.
 * @param[in]     max_out   Sức chứa tối đa của mảng out_rooms.
 * @return int Số lượng phòng thi trả về.
 */
int store_get_all_rooms(in_memory_store_t *store,
                        exam_room_t *out_rooms,
                        size_t max_out);

/**
 * @brief Truy vấn trạng thái phòng thi theo mã phòng (room_code) phục vụ HTTP Polling.
 *
 * Tự động kiểm tra mốc ends_at_ms với giờ chuẩn máy chủ để chuyển trạng thái sang
 * ENDED nếu thời gian làm bài đã kết thúc (Lazy Expiration).
 *
 * @param[in,out] store     Con trỏ tới kho lưu trữ.
 * @param[in]     room_code Mã phòng thi (ví dụ "ROOM01").
 * @param[out]    out_room  Con trỏ nhận trạng thái phòng thi mới nhất.
 * @return int 0 nếu tìm thấy, -1 nếu không tìm thấy phòng thi.
 */
int store_get_room_by_code(in_memory_store_t *store,
                           const char *room_code,
                           exam_room_t *out_room);

/**
 * @brief Khởi tạo một phòng thi mới ở trạng thái chờ (ROOM_STATUS_WAITING).
 *
 * @param[in,out] store    Con trỏ tới kho lưu trữ.
 * @param[in]     room     Thông tin cấu hình phòng thi cần tạo.
 * @param[out]    out_room Con trỏ nhận thông tin phòng thi vừa tạo.
 * @return int 0 nếu thành công, -2 nếu trùng mã room_code, -1 nếu kho đầy hoặc lỗi.
 */
int store_create_room(in_memory_store_t *store,
                      const exam_room_t *room,
                      exam_room_t *out_room);

/**
 * @brief Ghi nhận thí sinh tham gia vào phòng thi theo mã phòng.
 *
 * @param[in,out] store     Con trỏ tới kho lưu trữ.
 * @param[in]     room_code Mã phòng thi.
 * @param[in]     username  Tên định danh của thí sinh.
 * @param[out]    out_room  Con trỏ nhận trạng thái phòng thi sau khi tham gia.
 * @return int 0 nếu thành công, -2 nếu phòng thi đã kết thúc, -1 nếu không tìm thấy.
 */
int store_join_room(in_memory_store_t *store,
                    const char *room_code,
                    const char *username,
                    exam_room_t *out_room);

/**
 * @brief Bắt đầu tính giờ phòng thi (chuyển sang RUNNING và ấn định mốc ends_at_ms).
 *
 * @param[in,out] store     Con trỏ tới kho lưu trữ.
 * @param[in]     room_code Mã phòng thi cần bắt đầu.
 * @param[out]    out_room  Con trỏ nhận trạng thái phòng thi sau khi kích hoạt.
 * @return int 0 nếu thành công, -1 nếu không tìm thấy phòng thi.
 */
int store_start_room(in_memory_store_t *store,
                     const char *room_code,
                     exam_room_t *out_room);

/**
 * @brief Ghi nhận kết quả nộp bài của thí sinh (hỗ trợ khoảng dung sai ROOM_SUBMIT_GRACE_MS).
 *
 * @param[in,out] store     Con trỏ tới kho lưu trữ.
 * @param[in]     room_code Mã phòng thi.
 * @param[in]     username  Tên định danh thí sinh nộp bài.
 * @param[in]     score     Điểm số đạt được.
 * @param[out]    out_room  Con trỏ nhận trạng thái phòng thi sau khi nộp.
 * @return int 0 nếu hợp lệ, -2 nếu quá hạn nộp bài, -3 nếu phòng chưa chạy, -1 nếu không thấy.
 */
int store_submit_room_attempt(in_memory_store_t *store,
                              const char *room_code,
                              const char *username,
                              int score,
                              exam_room_t *out_room);

/**
 * @brief Đóng phòng thi thủ công ngay lập tức và chốt trạng thái nộp bài của mọi thí sinh.
 *
 * @param[in,out] store     Con trỏ tới kho lưu trữ.
 * @param[in]     room_code Mã phòng thi cần kết thúc.
 * @param[out]    out_room  Con trỏ nhận trạng thái phòng thi sau khi đóng.
 * @return int 0 nếu thành công, -1 nếu không tìm thấy phòng thi.
 */
int store_finish_room(in_memory_store_t *store,
                      const char *room_code,
                      exam_room_t *out_room);

#endif // IN_MEMORY_STORE_H
