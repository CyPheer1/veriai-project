package com.example.backendjava.dto.submission;

import java.time.Instant;
import java.util.UUID;

public record SubmissionAcceptedResponse(
        UUID submissionId,
        String status,
        Instant submittedAt,
        String message
) {
}
