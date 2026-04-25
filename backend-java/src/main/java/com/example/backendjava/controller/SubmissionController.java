package com.example.backendjava.controller;

import com.example.backendjava.dto.submission.SubmissionAcceptedResponse;
import com.example.backendjava.dto.submission.SubmissionDetailResponse;
import com.example.backendjava.dto.submission.SubmissionPageResponse;
import com.example.backendjava.dto.submission.TextAnalyzeRequest;
import com.example.backendjava.service.SubmissionService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping(path = {"/submissions/text", "/analyze/text"}, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SubmissionAcceptedResponse> analyzeText(
            Principal principal,
            @Valid @RequestBody TextAnalyzeRequest request
    ) {
        return ResponseEntity.accepted().body(submissionService.createTextSubmission(principal.getName(), request));
    }

    @PostMapping(path = {"/submissions/file", "/analyze/file"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SubmissionAcceptedResponse> analyzeFile(
            Principal principal,
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.accepted().body(submissionService.createFileSubmission(principal.getName(), file));
    }

    @GetMapping(path = {"/submissions/{submissionId}", "/analyze/{submissionId}"})
    public ResponseEntity<SubmissionDetailResponse> getSubmission(
            Principal principal,
            @PathVariable UUID submissionId
    ) {
        return ResponseEntity.ok(submissionService.getSubmissionDetail(principal.getName(), submissionId));
    }

    @GetMapping("/submissions")
    public ResponseEntity<SubmissionPageResponse> listSubmissions(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(submissionService.listSubmissions(principal.getName(), page, size));
    }
}
