package com.example.backendjava.dto.internal;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record InternalSubmissionResultRequest(
        String globalLabel,
        BigDecimal globalConfidence,
        BigDecimal layer1Score,
        BigDecimal layer2Score,
        BigDecimal layer3Score,
        Map<String, Double> modelAttribution,
        Map<String, Object> stylisticFeatures,
        Map<String, Object> statisticalFeatures,
        Boolean isReliable,
        List<InternalChunkResultRequest> chunks
) {
}
