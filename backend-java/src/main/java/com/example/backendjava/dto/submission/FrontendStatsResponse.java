package com.example.backendjava.dto.submission;

public record FrontendStatsResponse(
        Integer analyzed,
        Integer flagged,
        Integer clean
) {
}
