package com.example.backendjava.dto.submission;

import java.util.List;

public record FrontendResultsResponse(
        Integer aiScore,
        Integer humanScore,
        Integer confidence,
        String label,
        String model,
        String submittedText,
        Integer wordCount,
        List<FrontendModelAttributionResponse> modelAttributions,
        List<FrontendSegmentResponse> segments,
        List<FrontendChunkScoreResponse> chunks,
        FrontendStatsResponse stats
) {
}
