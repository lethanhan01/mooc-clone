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
import com.example.server.exception.AppException;
import com.example.server.exception.ErrorCode;
import com.example.server.repository.AttemptAnswerRepository;
import com.example.server.repository.ExamAttemptRepository;
import com.example.server.repository.ExamRoomRepository;
import com.example.server.repository.QuestionOptionRepository;
import com.example.server.repository.QuestionRepository;
import com.example.server.repository.UserRepository;
import com.example.server.service.ExamAttemptService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Transactional
public class ExamAttemptServiceImpl extends BaseServiceImpl<ExamAttemptEntity, Long, StartAttemptRequest, AttemptResultResponse, ExamAttemptRepository>
        implements ExamAttemptService {

    private final AttemptAnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final ExamRoomRepository roomRepository;
    private final UserRepository userRepository;

    public ExamAttemptServiceImpl(ExamAttemptRepository attemptRepository,
                                  AttemptAnswerRepository answerRepository,
                                  QuestionRepository questionRepository,
                                  QuestionOptionRepository optionRepository,
                                  ExamRoomRepository roomRepository,
                                  UserRepository userRepository) {
        super(attemptRepository);
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void submitAnswer(Long attemptId, Long questionId, Long selectedOptionId) {
        AttemptAnswerEntity answer = answerRepository.findByIdAttemptIdAndIdQuestionId(attemptId, questionId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy câu hỏi trong lượt thi: " + questionId));

        if (selectedOptionId != null) {
            QuestionOptionEntity option = optionRepository.findById(selectedOptionId)
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Phương án không tồn tại: " + selectedOptionId));
            answer.setSelectedOption(option);
        } else {
            answer.setSelectedOption(null);
        }
        answer.setAnsweredAt(OffsetDateTime.now());
        answerRepository.save(answer);
    }

    @Override
    public AttemptResultResponse submitExam(Long attemptId) {
        ExamAttemptEntity attempt = repository.findById(attemptId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy lượt thi với ID: " + attemptId));

        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
            attempt.setStatus(AttemptStatus.SUBMITTED);
            OffsetDateTime now = OffsetDateTime.now();
            attempt.setSubmittedAt(now);
            attempt.setGradedAt(now);
            repository.save(attempt);
        }

        return toResponseDto(attempt);
    }

    @Override
    @Transactional(readOnly = true)
    public AttemptResultResponse getResult(Long attemptId) {
        ExamAttemptEntity attempt = repository.findById(attemptId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy lượt thi với ID: " + attemptId));
        return toResponseDto(attempt);
    }

    @Override
    protected ExamAttemptEntity toEntity(StartAttemptRequest request) {
        UserEntity user = userRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED, "Chưa có tài khoản khởi tạo để bắt đầu lượt thi"));

        ExamAttemptEntity attempt = new ExamAttemptEntity();
        attempt.setUser(user);
        attempt.setMode(request.mode() != null ? request.mode() : AttemptMode.PRACTICE);
        attempt.setStatus(AttemptStatus.IN_PROGRESS);

        OffsetDateTime now = OffsetDateTime.now();
        attempt.setStartedAt(now);

        if (request.roomCode() != null && !request.roomCode().isBlank()) {
            ExamRoomEntity room = roomRepository.findByRoomCode(request.roomCode())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND, "Không tìm thấy phòng: " + request.roomCode()));
            attempt.setRoom(room);
            attempt.setDeadlineAt(now.plusSeconds(room.getDurationSeconds()));
        } else {
            attempt.setDeadlineAt(now.plusSeconds(1800)); // 30 phút mặc định cho luyện tập
        }

        ExamAttemptEntity saved = repository.save(attempt);

        // Khởi tạo danh sách câu hỏi cho attempt
        List<QuestionEntity> questions = questionRepository.findAll();
        Collections.shuffle(questions);
        int takeCount = Math.min(questions.size(), 10);
        List<AttemptAnswerEntity> answers = new ArrayList<>();
        for (int i = 0; i < takeCount; i++) {
            AttemptAnswerEntity answer = new AttemptAnswerEntity(saved, questions.get(i), i + 1);
            answers.add(answer);
        }
        answerRepository.saveAll(answers);
        saved.setAnswers(answers);

        return saved;
    }

    @Override
    protected AttemptResultResponse toResponseDto(ExamAttemptEntity entity) {
        List<AttemptAnswerEntity> answers = answerRepository.findByIdAttemptIdOrderByPositionAsc(entity.getId());
        int total = answers.size();
        int answered = 0;
        int correct = 0;
        int wrong = 0;

        List<AttemptAnswerResponse> answerResponses = new ArrayList<>();
        for (AttemptAnswerEntity a : answers) {
            Long optId = a.getSelectedOption() != null ? a.getSelectedOption().getId() : null;
            if (optId != null) {
                answered++;
                if (a.getSelectedOption().isCorrect()) {
                    correct++;
                } else {
                    wrong++;
                }
            }
            answerResponses.add(new AttemptAnswerResponse(
                    a.getQuestion().getId(),
                    a.getPosition(),
                    optId,
                    a.getAnsweredAt()
            ));
        }

        int unanswered = total - answered;
        double correctPercent = total > 0 ? (100.0 * correct / total) : 0.0;
        double score10 = total > 0 ? (10.0 * correct / total) : 0.0;

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
                Math.round(score10 * 10.0) / 10.0,
                Math.round(correctPercent * 10.0) / 10.0,
                entity.getStartedAt(),
                entity.getSubmittedAt(),
                answerResponses
        );
    }

    @Override
    protected void updateEntityFromDto(StartAttemptRequest request, ExamAttemptEntity entity) {
        if (request.mode() != null) entity.setMode(request.mode());
    }
}
