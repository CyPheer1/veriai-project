package com.example.backendjava.entity;

import java.util.Locale;

public enum ResultLabel {
    ai,
    human;

    public static ResultLabel fromString(String value) {
        if (value == null || value.isBlank()) {
            return human;
        }

        String normalized = value.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "ai" -> ai;
            case "human" -> human;
            default -> throw new IllegalArgumentException("Label must be ai or human");
        };
    }

    public boolean isAi() {
        return this == ai;
    }
}
