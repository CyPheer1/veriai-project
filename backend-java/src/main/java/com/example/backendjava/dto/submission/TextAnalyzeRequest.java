package com.example.backendjava.dto.submission;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TextAnalyzeRequest(
        @NotBlank @Size(max = 1000000) String text
) {
}
