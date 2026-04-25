package com.example.backendjava.controller.internal;

import com.example.backendjava.config.AppProperties;
import com.example.backendjava.dto.internal.InternalStatusUpdateRequest;
import com.example.backendjava.dto.internal.InternalSubmissionResultRequest;
import com.example.backendjava.dto.submission.SubmissionDetailResponse;
import com.example.backendjava.exception.ApiException;
import com.example.backendjava.service.SubmissionService;
import java.util.Objects;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/v1/submissions")
public class InternalSubmissionController {

    private static final String INTERNAL_TOKEN_HEADER = "X-Internal-Token";

    private final SubmissionService submissionService;
    private final AppProperties appProperties;

    @PostMapping("/{submissionId}/result")
    public ResponseEntity<SubmissionDetailResponse> upsertResult(
            @RequestHeader(name = INTERNAL_TOKEN_HEADER, required = false) String internalToken,
            @PathVariable UUID submissionId,
            @RequestBody InternalSubmissionResultRequest request
    ) {
        validateInternalToken(internalToken);
        return ResponseEntity.ok(submissionService.upsertInternalResult(submissionId, request));
    }

    @PostMapping("/{submissionId}/status")
    public ResponseEntity<SubmissionDetailResponse> updateStatus(
            @RequestHeader(name = INTERNAL_TOKEN_HEADER, required = false) String internalToken,
            @PathVariable UUID submissionId,
            @RequestBody InternalStatusUpdateRequest request
    ) {
        validateInternalToken(internalToken);
        return ResponseEntity.ok(submissionService.updateInternalStatus(submissionId, request));
    }

    private void validateInternalToken(String token) {
        if (!Objects.equals(token, appProperties.getInternal().getServiceToken())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid internal service token");
        }
    }
}
