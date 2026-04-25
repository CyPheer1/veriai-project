package com.example.backendjava.dto.internal;

import java.util.UUID;

public record FastApiDispatchRequest(
        UUID submissionId,
        String mode,
        String plan,
        Integer wordCount
) {
}
