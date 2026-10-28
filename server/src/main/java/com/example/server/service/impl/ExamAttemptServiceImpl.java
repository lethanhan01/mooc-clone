package com.example.server.service.impl;

import com.example.server.dto.attempt.AttemptAnswerResponse;
import com.example.server.dto.attempt.AttemptResultResponse;
import com.example.server.dto.attempt.StartAttemptRequest;
import com.example.server.entity.AttemptAnswerEntity;
import com.example.server.entity.ExamAttemptEntity;
import com.example.server.entity.ExamRoomEntity;
import com.example.server.entity.QuestionEntity;
import com.example.server.entity.QuestionOptionEntity;
import com.example.server.entity.UserEntity;
import com.example.server.entity.enums.AttemptMode;
import com.example.server.entity.enums.AttemptStatus;
import com.example.server.entity.enums.QuestionStatus;
import com.example.server.entity.enums.RoomStatus;
import com.example.server.entity.enums.SystemRole;
import com.example.server.exception.AppException;
import com.example.server.exception.ErrorCode;
import com.example.server.repository.AttemptAnswerRepository;
import com.example.server.repository.ExamAttemptRepository;
import com.example.server.repository.ExamRoomRepository;
import com.example.server.repository.QuestionOptionRepository;
import com.example.server.repository.QuestionRepository;
import com.example.server.security.SecurityUtil;
import com.example.server.service.ExamAttemptService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExamAttemptServiceImpl implements ExamAttemptService {

    private static final String ATTEMPT_NOT_FOUND_PREFIX = "Không tìm thấy lượt thi với ID: ";
    private static final String PLEASE_LOGIN_MESSAGE = "Vui lòng đăng nhập";
    private static final long SUBMIT_GRACE_PERIOD_SECONDS = 2L;

    private final ExamAttemptRepository attemptRepository;
    private final AttemptAnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final ExamRoomRepository roomRepository;

    public ExamAttemptServiceImpl(ExamAttemptRepository attemptRepository,
                                  AttemptAnswerRepository answerRepository,
                                  QuestionRepository questionRepository,
                                  QuestionOptionRepository optionRepository,
                                  ExamRoomRepository roomRepository) {
        this.attemptRepository = attemptRepository;
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.roomRepository = roomRepository;
    }

    @Override
    public AttemptResultResponse startAttempt(StartAttemptRequest request) {
        UserEntity currentUser = SecurityUtil.getCurrentUser()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED, "Vui lòng đăng nhập để bắt đầu lượt thi"));

        ExamAttemptEntity attempt = new ExamAttemptEntity();
        attempt.setUser(currentUser);
        attempt.setMode(request.mode() != null ? request.mode() : AttemptMode.PRACTICE);
        attempt.setStatus(AttemptStatus.IN_PROGRESS);

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        attempt.setStartedAt(now);

        if (request.roomCode() != null && !request.roomCode().isBlank()) {
            ExamRoomEntity room = roomRepository.findByRoomCode(request.roomCode())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND, "Không tìm thấy phòng: " + request.roomCode()));

            if (room.getStatus() == RoomStatus.RUNNING && room.getEndsAt() != null && !now.isBefore(room.getEndsAt())) {
                room.setStatus(RoomStatus.ENDED);
                room.setEndedAt(room.getEndsAt());
                roomRepository.save(room);
            }

            if (room.getStatus() == RoomStatus.ENDED || room.getStatus() == RoomStatus.CANCELLED) {
                throw new AppException(ErrorCode.ROOM_ALREADY_ENDED, "Phòng thi đã kết thúc");
            }

            attempt.setRoom(room);
            // Nếu phòng đang RUNNING có mốc endsAt chuẩn từ Server, đồng bộ deadline của thí sinh theo endsAt của phòng
            if (room.getEndsAt() != null) {
                attempt.setDeadlineAt(room.getEndsAt());
            } else {
                attempt.setDeadlineAt(now.plusSeconds(room.getDurationSeconds()));
            }
        } else {
            attempt.setDeadlineAt(now.plusSeconds(1800)); // 30 phút mặc định cho luyện tập
        }

        ExamAttemptEntity saved = attemptRepository.save(attempt);

        // Khởi tạo danh sách câu hỏi cho attempt (chỉ lấy câu hỏi ACTIVE)
        List<QuestionEntity> questions = questionRepository.findAll().stream()
                .filter(q -> q.getStatus() == QuestionStatus.ACTIVE)
                .collect(Collectors.toCollection(ArrayList::new));
        Collections.shuffle(questions);
        int takeCount = Math.min(questions.size(), 10);
        List<AttemptAnswerEntity> answers = new ArrayList<>();
        for (int i = 0; i < takeCount; i++) {
            AttemptAnswerEntity answer = new AttemptAnswerEntity(saved, questions.get(i), i + 1);
            answers.add(answer);
        }
        answerRepository.saveAll(answers);
        saved.setAnswers(answers);

        return toResponseDto(saved);
    }

    @Override
    public void submitAnswer(Long attemptId, Long questionId, Long selectedOptionId) {
        ExamAttemptEntity attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, ATTEMPT_NOT_FOUND_PREFIX + attemptId));

        UserEntity currentUser = SecurityUtil.getCurrentUser()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED, PLEASE_LOGIN_MESSAGE));

        if (!attempt.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Bạn không có quyền thao tác trên lượt thi của thí sinh khác");
        }

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new AppException(ErrorCode.ROOM_ALREADY_ENDED, "Bài thi đã nộp hoặc đã kết thúc, không thể nộp thêm đáp án");
        }

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        // Kiểm tra nếu phòng thi đã bị đóng sớm hoặc hết giờ (kèm Grace Period 2 giây)
        ExamRoomEntity room = attempt.getRoom();
        if (room != null) {
            if (room.getStatus() == RoomStatus.RUNNING
                    && room.getEndsAt() != null
                    && now.isAfter(room.getEndsAt().plusSeconds(SUBMIT_GRACE_PERIOD_SECONDS))) {
                room.setStatus(RoomStatus.ENDED);
                room.setEndedAt(room.getEndsAt());
                roomRepository.save(room);
            }
            if (room.getStatus() == RoomStatus.ENDED || room.getStatus() == RoomStatus.CANCELLED) {
                attempt.setStatus(AttemptStatus.TIMED_OUT);
                attemptRepository.save(attempt);
                throw new AppException(ErrorCode.ROOM_ALREADY_ENDED, "Phòng thi đã kết thúc, không thể nộp thêm đáp án");
            }
        }

        if (attempt.getDeadlineAt() != null
                && now.isAfter(attempt.getDeadlineAt().plusSeconds(SUBMIT_GRACE_PERIOD_SECONDS))) {
            attempt.setStatus(AttemptStatus.TIMED_OUT);
            attemptRepository.save(attempt);
            throw new AppException(ErrorCode.ROOM_ALREADY_ENDED, "Đã hết thời gian làm bài thi");
        }

        AttemptAnswerEntity answer = answerRepository.findByIdAttemptIdAndIdQuestionId(attemptId, questionId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy câu hỏi trong lượt thi: " + questionId));

        if (selectedOptionId != null) {
            QuestionOptionEntity option = optionRepository.findById(selectedOptionId)
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Phương án không tồn tại: " + selectedOptionId));
            answer.setSelectedOption(option);
        } else {
            answer.setSelectedOption(null);
        }
        answer.setAnsweredAt(now);
        answerRepository.save(answer);
    }

    @Override
    public AttemptResultResponse submitExam(Long attemptId) {
        ExamAttemptEntity attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, ATTEMPT_NOT_FOUND_PREFIX + attemptId));

        UserEntity currentUser = SecurityUtil.getCurrentUser()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED, PLEASE_LOGIN_MESSAGE));

        if (!attempt.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Bạn không có quyền nộp bài thi của thí sinh khác");
        }

        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
            attempt.setStatus(AttemptStatus.SUBMITTED);
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            attempt.setSubmittedAt(now);
            attempt.setGradedAt(now);
            attemptRepository.save(attempt);
        }

        return toResponseDto(attempt);
    }

    @Override
    @Transactional(readOnly = true)
    public AttemptResultResponse getResult(Long attemptId) {
        ExamAttemptEntity attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, ATTEMPT_NOT_FOUND_PREFIX + attemptId));

        UserEntity currentUser = SecurityUtil.getCurrentUser()
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED, PLEASE_LOGIN_MESSAGE));

        if (currentUser.getSystemRole() != SystemRole.TEACHER && !attempt.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Bạn không có quyền xem kết quả bài thi của thí sinh khác");
        }

        return toResponseDto(attempt);
    }

    private AttemptResultResponse toResponseDto(ExamAttemptEntity entity) {
        List<AttemptAnswerEntity> answers = answerRepository.findByIdAttemptIdOrderByPositionAsc(entity.getId());
        int total = answers.size();
        int answered = 0;
        int correct = 0;

        List<AttemptAnswerResponse> answerDtos = new ArrayList<>();
        for (AttemptAnswerEntity ans : answers) {
            QuestionOptionEntity opt = ans.getSelectedOption();
            Long selectedId = null;
            if (opt != null) {
                selectedId = opt.getId();
                answered++;
                if (opt.isCorrect()) {
                    correct++;
                }
            }
            answerDtos.add(new AttemptAnswerResponse(
                    ans.getQuestion().getId(),
                    ans.getPosition(),
                    selectedId,
                    ans.getAnsweredAt()
            ));
        }

        int wrong = answered - correct;
        int unanswered = total - answered;
        double score10 = total > 0 ? Math.round((correct * 10.0 / total) * 100.0) / 100.0 : 0.0;
        double correctPercent = total > 0 ? Math.round((correct * 100.0 / total) * 100.0) / 100.0 : 0.0;

        return new AttemptResultResponse(
                entity.getId(),
                entity.getUser().getId(),
                entity.getUser().getUsername(),
                entity.getUser().getDisplayName(),
                entity.getRoom() != null ? entity.getRoom().getId() : null,
                entity.getRoom() != null ? entity.getRoom().getRoomCode() : null,
                entity.getMode().name(),
                entity.getStatus().name(),
                total,
                answered,
                correct,
                wrong,
                unanswered,
                score10,
                correctPercent,
                entity.getStartedAt(),
                entity.getSubmittedAt(),
                answerDtos
        );
    }
}
