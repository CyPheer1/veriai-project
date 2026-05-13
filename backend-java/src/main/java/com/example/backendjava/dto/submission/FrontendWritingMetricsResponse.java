package com.example.backendjava.dto.submission;

public record FrontendWritingMetricsResponse(
        Double vocabularyDiversity,
        Double avgSentenceLength,
        Double sentenceLengthVariance,
        Double burstinessScore,
        Double perplexity,
        Double avgTokenEntropy,
        Double logicalConnectorRatio
) {
}
