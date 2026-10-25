package com.example.server.service.impl;

import com.example.server.dto.question.CreateQuestionRequest;
import com.example.server.dto.question.QuestionOptionResponse;
import com.example.server.dto.question.QuestionResponse;
import com.example.server.entity.QuestionEntity;
import com.example.server.entity.QuestionOptionEntity;
import com.example.server.entity.enums.QuestionStatus;
import com.example.server.exception.AppException;
import com.example.server.exception.ErrorCode;
import com.example.server.repository.QuestionRepository;
import com.example.server.service.QuestionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class QuestionServiceImpl extends BaseServiceImpl<QuestionEntity, Long, CreateQuestionRequest, QuestionResponse, QuestionRepository>
        implements QuestionService {

    public QuestionServiceImpl(QuestionRepository repository) {
        super(repository);
    }

    @Override
    protected QuestionEntity toEntity(CreateQuestionRequest request) {
        QuestionEntity entity = new QuestionEntity();
        entity.setTopic(request.topic());
        entity.setDifficulty(request.difficulty());
        entity.setQuestionType(request.questionType());
        entity.setContent(request.content());
        entity.setStatus(QuestionStatus.ACTIVE);

        if (request.options() != null) {
            List<QuestionOptionEntity> options = request.options().stream().map(optReq -> {
                QuestionOptionEntity opt = new QuestionOptionEntity();
                opt.setQuestion(entity);
                opt.setContent(optReq.content());
                opt.setPosition(optReq.position());
                opt.setCorrect(optReq.isCorrect());
                return opt;
            }).toList();
            entity.setOptions(options);
        }
        return entity;
    }

    @Override
    protected QuestionResponse toResponseDto(QuestionEntity entity) {
        List<QuestionOptionResponse> optionDtos = entity.getOptions() == null ? List.of() :
                entity.getOptions().stream()
                        .map(opt -> new QuestionOptionResponse(opt.getId(), opt.getContent(), opt.getPosition(), opt.isCorrect()))
                        .toList();

        return new QuestionResponse(
                entity.getId(),
                entity.getTopic(),
                entity.getDifficulty().name(),
                entity.getQuestionType().name(),
                entity.getContent(),
                entity.getStatus().name(),
                optionDtos,
                entity.getCreatedAt()
        );
    }

    @Override
    protected void updateEntityFromDto(CreateQuestionRequest request, QuestionEntity entity) {
        if (request.topic() != null) entity.setTopic(request.topic());
        if (request.difficulty() != null) entity.setDifficulty(request.difficulty());
        if (request.content() != null) entity.setContent(request.content());
    }

    @Override
    public void deleteById(Long id) {
        QuestionEntity question = repository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy câu hỏi với ID: " + id));
        question.setStatus(QuestionStatus.ARCHIVED);
        repository.save(question);
    }
}
