package com.example.backendjava.dto.submission;

import java.time.Instant;
import java.util.UUID;

public record SubmissionDetailResponse(
        UUID submissionId,
        String status,
        String sourceType,
        String sourceFilename,
        String processingMode,
        Integer wordCount,
        String originalText,
        Instant submittedAt,
        Instant startedAt,
        Instant completedAt,
        String errorMessage,
        AnalysisResultResponse result,
        FrontendResultsResponse frontendPayload
) {
}
