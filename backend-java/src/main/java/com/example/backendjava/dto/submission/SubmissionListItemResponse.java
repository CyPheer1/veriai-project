package com.example.backendjava.dto.submission;

import java.time.Instant;
import java.util.UUID;

public record SubmissionListItemResponse(
        UUID submissionId,
        String status,
        String sourceType,
        String processingMode,
        Integer wordCount,
        Instant submittedAt,
        Instant completedAt,
        String globalLabel,
        Double globalConfidence,
        String errorMessage
) {
}
