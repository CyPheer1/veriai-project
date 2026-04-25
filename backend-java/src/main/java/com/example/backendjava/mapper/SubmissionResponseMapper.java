package com.example.backendjava.mapper;

import com.example.backendjava.dto.submission.AnalysisResultResponse;
import com.example.backendjava.dto.submission.ChunkResponse;
import com.example.backendjava.dto.submission.FrontendChunkScoreResponse;
import com.example.backendjava.dto.submission.FrontendModelAttributionResponse;
import com.example.backendjava.dto.submission.FrontendResultsResponse;
import com.example.backendjava.dto.submission.FrontendSegmentResponse;
import com.example.backendjava.dto.submission.FrontendStatsResponse;
import com.example.backendjava.dto.submission.LayerScoresResponse;
import com.example.backendjava.dto.submission.SubmissionDetailResponse;
import com.example.backendjava.dto.submission.SubmissionListItemResponse;
import com.example.backendjava.entity.ResultLabel;
import com.example.backendjava.entity.Submission;
import com.example.backendjava.entity.SubmissionChunk;
import com.example.backendjava.entity.SubmissionResult;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SubmissionResponseMapper {

    private final ObjectMapper objectMapper;

    public SubmissionListItemResponse toListItem(Submission submission, SubmissionResult result) {
        return new SubmissionListItemResponse(
                submission.getId(),
                submission.getStatus().name(),
                submission.getSourceType().name(),
                submission.getProcessingMode().name(),
                submission.getWordCount(),
                submission.getSubmittedAt(),
                submission.getCompletedAt(),
                result != null ? labelAsString(result.getGlobalLabel()) : null,
                result != null ? toDouble(result.getGlobalConfidence()) : null,
                submission.getErrorMessage()
        );
    }

    public SubmissionDetailResponse toDetail(Submission submission, SubmissionResult result, List<SubmissionChunk> chunks) {
        AnalysisResultResponse analysisResult = null;
        FrontendResultsResponse frontendPayload = null;

        if (result != null) {
            Map<String, Double> modelAttribution = parseDoubleMap(result.getModelAttribution());
            Map<String, Object> stylisticFeatures = parseObjectMap(result.getStylisticFeatures());
            Map<String, Object> statisticalFeatures = parseObjectMap(result.getStatisticalFeatures());

            List<ChunkResponse> chunkResponses = chunks.stream()
                    .sorted(Comparator.comparing(SubmissionChunk::getChunkIndex))
                    .map(chunk -> {
                        boolean isAI = isAi(chunk.getLabel());
                        return new ChunkResponse(
                                chunk.getChunkIndex(),
                                chunk.getChunkText(),
                                labelAsString(chunk.getLabel()),
                                toDouble(chunk.getConfidence()),
                                toNullableDouble(chunk.getLayer1Score()),
                                toNullableDouble(chunk.getLayer2Score()),
                                toNullableDouble(chunk.getLayer3Score()),
                                isAI,
                                isAI ? "ai" : "human"
                        );
                    })
                    .toList();

            analysisResult = new AnalysisResultResponse(
                    labelAsString(result.getGlobalLabel()),
                    toDouble(result.getGlobalConfidence()),
                    new LayerScoresResponse(
                            toNullableDouble(result.getLayer1Score()),
                            toNullableDouble(result.getLayer2Score()),
                            toNullableDouble(result.getLayer3Score())
                    ),
                    modelAttribution,
                    stylisticFeatures,
                    statisticalFeatures,
                    result.getIsReliable(),
                    submission.getWordCount(),
                    submission.getSubmittedAt(),
                    chunkResponses
            );

            frontendPayload = buildFrontendPayload(submission, result, chunks, modelAttribution);
        }

        return new SubmissionDetailResponse(
                submission.getId(),
                submission.getStatus().name(),
                submission.getSourceType().name(),
                submission.getSourceFilename(),
                submission.getProcessingMode().name(),
                submission.getWordCount(),
                submission.getOriginalText(),
                submission.getSubmittedAt(),
                submission.getStartedAt(),
                submission.getCompletedAt(),
                submission.getErrorMessage(),
                analysisResult,
                frontendPayload
        );
    }

    private FrontendResultsResponse buildFrontendPayload(
            Submission submission,
            SubmissionResult result,
            List<SubmissionChunk> chunks,
            Map<String, Double> modelAttribution
    ) {
        int aiScore = toPercent(result.getGlobalConfidence());
        int humanScore = Math.max(0, 100 - aiScore);
        int confidence = Math.max(aiScore, humanScore);

        String label = aiScore >= 75 ? "Likely AI-Generated"
                : aiScore >= 45 ? "Mixed Content"
                : "Likely Human-Written";

        List<Map.Entry<String, Double>> sortedAttributions = modelAttribution.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .toList();

        String modelName = sortedAttributions.isEmpty()
                ? "Unknown"
                : sortedAttributions.getFirst().getKey();

        List<FrontendModelAttributionResponse> modelAttributionItems = sortedAttributions.stream()
                .map(entry -> new FrontendModelAttributionResponse(entry.getKey(), (int) Math.round(entry.getValue() * 100)))
                .toList();

        List<FrontendSegmentResponse> segments = chunks.stream()
                .sorted(Comparator.comparing(SubmissionChunk::getChunkIndex))
                .map(chunk -> new FrontendSegmentResponse(chunk.getChunkText(), isAi(chunk.getLabel())))
                .toList();

        List<FrontendChunkScoreResponse> chunkScores = chunks.stream()
                .sorted(Comparator.comparing(SubmissionChunk::getChunkIndex))
                .map(chunk -> new FrontendChunkScoreResponse(chunk.getChunkText(), (int) Math.round(toDouble(chunk.getConfidence()) * 100)))
                .toList();

        int flagged = (int) chunks.stream().filter(chunk -> isAi(chunk.getLabel())).count();
        int clean = Math.max(0, chunks.size() - flagged);

        FrontendStatsResponse stats = new FrontendStatsResponse(chunks.size(), flagged, clean);

        return new FrontendResultsResponse(
                aiScore,
                humanScore,
                confidence,
                label,
                modelName,
                submission.getOriginalText(),
                submission.getWordCount(),
                modelAttributionItems,
                segments,
                chunkScores,
                stats
        );
    }

    private Map<String, Double> parseDoubleMap(String json) {
        if (json == null || json.isBlank()) {
            return Map.of();
        }

        try {
            Map<String, Object> map = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {
            });
            Map<String, Double> result = new LinkedHashMap<>();
            map.forEach((k, v) -> {
                if (v instanceof Number number) {
                    result.put(k, number.doubleValue());
                }
            });
            return result;
        } catch (Exception ex) {
            log.warn("Failed to parse model attribution JSON: {}", ex.getMessage());
            return Map.of();
        }
    }

    private Map<String, Object> parseObjectMap(String json) {
        if (json == null || json.isBlank()) {
            return Map.of();
        }

        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {
            });
        } catch (Exception ex) {
            log.warn("Failed to parse JSON object: {}", ex.getMessage());
            return Map.of();
        }
    }

    private double toDouble(BigDecimal value) {
        return value == null ? 0.0 : value.doubleValue();
    }

    private Double toNullableDouble(BigDecimal value) {
        return value == null ? null : value.doubleValue();
    }

    private String labelAsString(ResultLabel label) {
        return label == null ? null : label.name();
    }

    private boolean isAi(ResultLabel label) {
        return label != null && label.isAi();
    }

    private int toPercent(BigDecimal value) {
        return (int) Math.round(toDouble(value) * 100.0);
    }
}
