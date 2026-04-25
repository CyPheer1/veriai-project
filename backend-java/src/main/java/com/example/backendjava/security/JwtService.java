package com.example.backendjava.security;

import com.example.backendjava.config.AppProperties;
import com.example.backendjava.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final AppProperties appProperties;

    public String generateToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(appProperties.getJwt().getExpirationSeconds());

        return Jwts.builder()
                .claims(Map.of(
                        "uid", user.getId().toString(),
                        "plan", user.getPlan().name()
                ))
                .subject(user.getEmail())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(getSigningKey())
                .compact();
    }

    public long getExpirationSeconds() {
        return appProperties.getJwt().getExpirationSeconds();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equalsIgnoreCase(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        Date expiration = extractAllClaims(token).getExpiration();
        return expiration.before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Key getSigningKey() {
        String secret = appProperties.getJwt().getSecret();

        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT secret must be configured");
        }

        // Accept either a plain secret or base64-encoded secret.
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (Exception ignored) {
            // DecodingException or IllegalArgumentException for non-base64 secrets.
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }

        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 bytes");
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }
}
