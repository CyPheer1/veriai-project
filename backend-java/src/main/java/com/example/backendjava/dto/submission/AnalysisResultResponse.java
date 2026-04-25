package com.example.backendjava.dto.submission;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record AnalysisResultResponse(
        String globalLabel,
        Double globalConfidence,
        LayerScoresResponse layerScores,
        Map<String, Double> modelAttribution,
        Map<String, Object> stylisticFeatures,
        Map<String, Object> statisticalFeatures,
        Boolean isReliable,
        Integer wordCount,
        Instant submissionTimestamp,
        List<ChunkResponse> chunks
) {
}
