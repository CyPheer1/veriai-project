package com.example.backendjava.service;

import com.example.backendjava.entity.SubmissionSourceType;

public record ExtractedContent(
        SubmissionSourceType sourceType,
        String sourceFilename,
        String text
) {
}
