package com.example.backendjava.service;

import com.example.backendjava.dto.internal.InternalChunkResultRequest;
import com.example.backendjava.dto.internal.InternalStatusUpdateRequest;
import com.example.backendjava.dto.internal.InternalSubmissionResultRequest;
import com.example.backendjava.dto.submission.SubmissionAcceptedResponse;
import com.example.backendjava.dto.submission.SubmissionDetailResponse;
import com.example.backendjava.dto.submission.SubmissionListItemResponse;
import com.example.backendjava.dto.submission.SubmissionPageResponse;
import com.example.backendjava.dto.submission.TextAnalyzeRequest;
import com.example.backendjava.entity.ProcessingMode;
import com.example.backendjava.entity.ResultLabel;
import com.example.backendjava.entity.Submission;
import com.example.backendjava.entity.SubmissionChunk;
import com.example.backendjava.entity.SubmissionResult;
import com.example.backendjava.entity.SubmissionSourceType;
import com.example.backendjava.entity.SubmissionStatus;
import com.example.backendjava.entity.User;
import com.example.backendjava.entity.UserPlan;
import com.example.backendjava.exception.ApiException;
import com.example.backendjava.mapper.SubmissionResponseMapper;
import com.example.backendjava.repository.SubmissionChunkRepository;
import com.example.backendjava.repository.SubmissionRepository;
import com.example.backendjava.repository.SubmissionResultRepository;
import com.example.backendjava.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;
    private final SubmissionResultRepository submissionResultRepository;
    private final SubmissionChunkRepository submissionChunkRepository;
    private final QuotaService quotaService;
    private final FileExtractionService fileExtractionService;
    private final SubmissionDispatchService submissionDispatchService;
    private final SubmissionResponseMapper submissionResponseMapper;
    private final ObjectMapper objectMapper;

    @Transactional
    public SubmissionAcceptedResponse createTextSubmission(String email, TextAnalyzeRequest request) {
        User user = getUserForUpdate(email);
        quotaService.consumeQuota(user);

        String text = normalizeText(request.text());
        if (text.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Text content is required");
        }

        Submission submission = buildSubmission(user, SubmissionSourceType.TEXT, null, text);
        Submission saved = submissionRepository.save(submission);

        submissionDispatchService.dispatchSubmission(
                saved.getId(),
                saved.getProcessingMode(),
                user.getPlan(),
                saved.getWordCount()
        );

        log.info("Text submission {} created for user {}", saved.getId(), user.getEmail());

        return new SubmissionAcceptedResponse(
                saved.getId(),
                saved.getStatus().name(),
                saved.getSubmittedAt(),
                "Submission accepted and queued for AI processing"
        );
    }

    @Transactional
    public SubmissionAcceptedResponse createFileSubmission(String email, MultipartFile file) {
        User user = getUserForUpdate(email);
        ExtractedContent extractedContent = fileExtractionService.extractText(file, user.getPlan());

        quotaService.consumeQuota(user);

        Submission submission = buildSubmission(
                user,
                extractedContent.sourceType(),
                extractedContent.sourceFilename(),
                extractedContent.text()
        );

        Submission saved = submissionRepository.save(submission);

        submissionDispatchService.dispatchSubmission(
                saved.getId(),
                saved.getProcessingMode(),
                user.getPlan(),
                saved.getWordCount()
        );

        log.info("File submission {} created for user {}", saved.getId(), user.getEmail());

        return new SubmissionAcceptedResponse(
                saved.getId(),
                saved.getStatus().name(),
                saved.getSubmittedAt(),
                "Submission accepted and queued for AI processing"
        );
    }

    @Transactional(readOnly = true)
    public SubmissionDetailResponse getSubmissionDetail(String email, UUID submissionId) {
        User user = getUserByEmail(email);

        Submission submission = submissionRepository.findByIdAndUserId(submissionId, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Submission not found"));

        SubmissionResult result = submissionResultRepository.findById(submissionId).orElse(null);
        List<SubmissionChunk> chunks = result == null
                ? List.of()
                : submissionChunkRepository.findBySubmissionIdOrderByChunkIndexAsc(submissionId);

        return submissionResponseMapper.toDetail(submission, result, chunks);
    }

    @Transactional(readOnly = true)
    public SubmissionPageResponse listSubmissions(String email, int page, int size) {
        User user = getUserByEmail(email);

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Page<Submission> submissionsPage = submissionRepository.findByUserIdOrderBySubmittedAtDesc(
                user.getId(),
                PageRequest.of(safePage, safeSize)
        );

        List<SubmissionListItemResponse> items = submissionsPage.getContent().stream()
                .map(submission -> submissionResponseMapper.toListItem(
                        submission,
                        submissionResultRepository.findById(submission.getId()).orElse(null)
                ))
                .toList();

        return new SubmissionPageResponse(
                items,
                submissionsPage.getNumber(),
                submissionsPage.getSize(),
                submissionsPage.getTotalElements(),
                submissionsPage.getTotalPages()
        );
    }

    @Transactional
    public SubmissionDetailResponse upsertInternalResult(UUID submissionId, InternalSubmissionResultRequest request) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Submission not found"));

        Instant now = Instant.now();

        SubmissionResult result = submissionResultRepository.findById(submissionId)
                .orElseGet(() -> SubmissionResult.builder()
                        .submissionId(submissionId)
                        .submission(submission)
                        .createdAt(now)
                        .build());

        result.setSubmission(submission);
        result.setSubmissionId(submissionId);
        result.setGlobalLabel(normalizeResultLabel(request.globalLabel()));
        result.setGlobalConfidence(requiredDecimal(request.globalConfidence(), "globalConfidence"));
        result.setLayer1Score(request.layer1Score());
        result.setLayer2Score(request.layer2Score());
        result.setLayer3Score(request.layer3Score());
        result.setModelAttribution(toJson(request.modelAttribution() == null ? Map.of() : request.modelAttribution()));
        result.setStylisticFeatures(toJson(request.stylisticFeatures() == null ? Map.of() : request.stylisticFeatures()));
        result.setStatisticalFeatures(toJson(request.statisticalFeatures() == null ? Map.of() : request.statisticalFeatures()));
        result.setIsReliable(Boolean.TRUE.equals(request.isReliable()));
        if (result.getCreatedAt() == null) {
            result.setCreatedAt(now);
        }
        result.setUpdatedAt(now);

        SubmissionResult savedResult = submissionResultRepository.save(result);

        submissionChunkRepository.deleteBySubmissionId(submissionId);

        List<InternalChunkResultRequest> incomingChunks = request.chunks() == null ? List.of() : request.chunks();
        List<SubmissionChunk> chunks = incomingChunks.stream()
                .map(chunk -> SubmissionChunk.builder()
                        .submission(submission)
                        .chunkIndex(chunk.chunkIndex())
                        .chunkText(chunk.chunkText())
                        .wordCount(chunk.wordCount() == null ? countWords(chunk.chunkText()) : chunk.wordCount())
                        .label(normalizeResultLabel(chunk.label()))
                        .confidence(requiredDecimal(chunk.confidence(), "chunk confidence"))
                        .layer1Score(chunk.layer1Score())
                        .layer2Score(chunk.layer2Score())
                        .layer3Score(chunk.layer3Score())
                        .stylisticFeatures(toJson(chunk.stylisticFeatures() == null ? Map.of() : chunk.stylisticFeatures()))
                        .statisticalFeatures(toJson(chunk.statisticalFeatures() == null ? Map.of() : chunk.statisticalFeatures()))
                        .createdAt(now)
                        .build())
                .sorted(Comparator.comparing(SubmissionChunk::getChunkIndex))
                .toList();

        if (!chunks.isEmpty()) {
            submissionChunkRepository.saveAll(chunks);
        }

        submission.setStatus(SubmissionStatus.COMPLETED);
        if (submission.getStartedAt() == null) {
            submission.setStartedAt(now);
        }
        submission.setCompletedAt(now);
        submission.setErrorMessage(null);
        submission.setUpdatedAt(now);
        submissionRepository.save(submission);

        log.info("Internal result stored for submission {} with {} chunks", submissionId, chunks.size());

        return submissionResponseMapper.toDetail(submission, savedResult, chunks);
    }

    @Transactional
    public SubmissionDetailResponse updateInternalStatus(UUID submissionId, InternalStatusUpdateRequest request) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Submission not found"));

        SubmissionStatus status = parseStatus(request.status());
        Instant now = Instant.now();

        submission.setStatus(status);

        if (request.errorMessage() != null) {
            submission.setErrorMessage(request.errorMessage());
        }

        if (status == SubmissionStatus.PROCESSING) {
            submission.setStartedAt(request.startedAt() != null ? request.startedAt() : now);
            submission.setCompletedAt(null);
        }

        if (status == SubmissionStatus.COMPLETED || status == SubmissionStatus.ERROR) {
            submission.setCompletedAt(request.completedAt() != null ? request.completedAt() : now);
        }

        submission.setUpdatedAt(now);

        Submission saved = submissionRepository.save(submission);
        SubmissionResult result = submissionResultRepository.findById(submissionId).orElse(null);
        List<SubmissionChunk> chunks = result == null
                ? List.of()
                : submissionChunkRepository.findBySubmissionIdOrderByChunkIndexAsc(submissionId);

        return submissionResponseMapper.toDetail(saved, result, chunks);
    }

    private Submission buildSubmission(User user, SubmissionSourceType sourceType, String sourceFilename, String text) {
        String normalizedText = normalizeText(text);
        if (normalizedText.isBlank()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Submission text cannot be empty");
        }

        int wordCount = countWords(normalizedText);
        Instant now = Instant.now();

        return Submission.builder()
                .user(user)
                .sourceType(sourceType)
                .sourceFilename(sourceFilename)
                .originalText(normalizedText)
                .processingMode(user.getPlan() == UserPlan.PRO ? ProcessingMode.FULL : ProcessingMode.QUICK)
                .status(SubmissionStatus.PENDING)
                .wordCount(wordCount)
                .errorMessage(null)
                .submittedAt(now)
                .startedAt(null)
                .completedAt(null)
                .updatedAt(now)
                .build();
    }

    private String toJson(Object payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unable to serialize result payload");
        }
    }

    private SubmissionStatus parseStatus(String value) {
        if (value == null || value.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Status is required");
        }

        try {
            return SubmissionStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid status value");
        }
    }

    private ResultLabel normalizeResultLabel(String label) {
        try {
            return ResultLabel.fromString(label);
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Label must be ai or human");
        }
    }

    private java.math.BigDecimal requiredDecimal(java.math.BigDecimal value, String fieldName) {
        if (value == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, fieldName + " is required");
        }
        return value;
    }

    private String normalizeText(String text) {
        return text == null ? "" : text.trim();
    }

    private int countWords(String text) {
        String normalized = normalizeText(text);
        if (normalized.isBlank()) {
            return 0;
        }
        return normalized.split("\\s+").length;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private User getUserForUpdate(String email) {
        return userRepository.findByEmailForUpdate(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
