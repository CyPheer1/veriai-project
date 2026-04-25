package com.example.backendjava.service;

import com.example.backendjava.dto.auth.AuthResponse;
import com.example.backendjava.dto.auth.AuthUserResponse;
import com.example.backendjava.dto.auth.LoginRequest;
import com.example.backendjava.dto.auth.RegisterRequest;
import com.example.backendjava.entity.User;
import com.example.backendjava.entity.UserPlan;
import com.example.backendjava.exception.ApiException;
import com.example.backendjava.repository.UserRepository;
import com.example.backendjava.security.JwtService;
import java.time.Instant;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        Instant now = Instant.now();
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .plan(parsePlan(request.plan()))
                .dailySubmissionCount(0)
                .lastSubmissionDate(null)
                .createdAt(now)
                .updatedAt(now)
                .build();

        User savedUser = userRepository.save(user);
        return buildAuthResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password())
            );
        } catch (BadCredentialsException ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthUserResponse me(String email) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        return toAuthUserResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        Instant expiresAt = Instant.now().plusSeconds(jwtService.getExpirationSeconds());
        return new AuthResponse(
                "Bearer",
                jwtService.generateToken(user),
                expiresAt,
                toAuthUserResponse(user)
        );
    }

    private AuthUserResponse toAuthUserResponse(User user) {
        return new AuthUserResponse(
                user.getId(),
                user.getEmail(),
                user.getPlan().name(),
                user.getDailySubmissionCount(),
                user.getLastSubmissionDate(),
                user.getCreatedAt()
        );
    }

    private UserPlan parsePlan(String rawPlan) {
        if (rawPlan == null || rawPlan.isBlank()) {
            return UserPlan.FREE;
        }

        try {
            return UserPlan.valueOf(rawPlan.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Plan must be FREE or PRO");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
