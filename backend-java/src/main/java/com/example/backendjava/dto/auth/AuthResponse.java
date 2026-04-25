package com.example.backendjava.dto.auth;

import java.time.Instant;

public record AuthResponse(
        String tokenType,
        String accessToken,
        Instant expiresAt,
        AuthUserResponse user
) {
}
