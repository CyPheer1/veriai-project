package com.example.backendjava.dto.submission;

import java.util.List;

public record SubmissionPageResponse(
        List<SubmissionListItemResponse> items,
        int page,
        int size,
        long totalItems,
        int totalPages
) {
}
