package com.example.backendjava.service;

import com.example.backendjava.config.AppProperties;
import com.example.backendjava.dto.internal.FastApiDispatchRequest;
import com.example.backendjava.entity.ProcessingMode;
import com.example.backendjava.entity.Submission;
import com.example.backendjava.entity.SubmissionStatus;
import com.example.backendjava.entity.UserPlan;
import com.example.backendjava.repository.SubmissionRepository;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubmissionDispatchService {

    private final RestClient restClient;
    private final AppProperties appProperties;
    private final SubmissionRepository submissionRepository;

    @Async("submissionTaskExecutor")
    @Transactional
    public void dispatchSubmission(UUID submissionId, ProcessingMode mode, UserPlan plan, Integer wordCount) {
        // Retry loop: the creating @Transactional may not have committed yet
        Submission submission = null;
        for (int attempt = 0; attempt < 10; attempt++) {
            submission = submissionRepository.findById(submissionId).orElse(null);
            if (submission != null) {
                break;
            }
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Dispatch interrupted for submission {}", submissionId);
                return;
            }
        }
        if (submission == null) {
            log.warn("Submission {} not found during dispatch after retries", submissionId);
            return;
        }

        try {
            FastApiDispatchRequest payload = new FastApiDispatchRequest(submissionId, mode.name(), plan.name(), wordCount);
            String url = appProperties.getAiService().getBaseUrl() + appProperties.getAiService().getEnqueuePath();

            restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("X-Internal-Token", appProperties.getInternal().getServiceToken())
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();

            submission.setStatus(SubmissionStatus.PROCESSING);
            submission.setStartedAt(Instant.now());
            submission.setErrorMessage(null);
            submission.setUpdatedAt(Instant.now());

            log.info("Submission {} dispatched to AI service", submissionId);
        } catch (Exception ex) {
            submission.setStatus(SubmissionStatus.ERROR);
            submission.setErrorMessage("Failed to enqueue AI processing");
            submission.setCompletedAt(Instant.now());
            submission.setUpdatedAt(Instant.now());
            log.error("Failed to dispatch submission {} to AI service: {}", submissionId, ex.getMessage());
        }
    }
}
