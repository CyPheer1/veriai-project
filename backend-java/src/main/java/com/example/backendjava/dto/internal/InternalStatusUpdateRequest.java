package com.example.backendjava.dto.internal;

import java.time.Instant;

public record InternalStatusUpdateRequest(
        String status,
        String errorMessage,
        Instant startedAt,
        Instant completedAt
) {
}
