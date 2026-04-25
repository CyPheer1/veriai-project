package com.example.backendjava.dto.submission;

public record ChunkResponse(
        Integer index,
        String text,
        String label,
        Double confidence,
        Double layer1Score,
        Double layer2Score,
        Double layer3Score,
        Boolean isAI,
        String color
) {
}
