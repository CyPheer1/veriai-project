package com.example.backendjava.dto.internal;

import java.math.BigDecimal;
import java.util.Map;

public record InternalChunkResultRequest(
        Integer chunkIndex,
        String chunkText,
        Integer wordCount,
        String label,
        BigDecimal confidence,
        BigDecimal layer1Score,
        BigDecimal layer2Score,
        BigDecimal layer3Score,
        Map<String, Object> stylisticFeatures,
        Map<String, Object> statisticalFeatures
) {
}
