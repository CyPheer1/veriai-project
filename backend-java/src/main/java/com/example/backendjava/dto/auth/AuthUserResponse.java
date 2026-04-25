package com.example.backendjava.dto.auth;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AuthUserResponse(
        UUID id,
        String email,
        String plan,
        Integer dailySubmissionCount,
        LocalDate lastSubmissionDate,
        Instant createdAt
) {
}
