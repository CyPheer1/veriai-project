package com.example.backendjava.repository;

import com.example.backendjava.entity.Submission;
import com.example.backendjava.entity.SubmissionStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<Submission, UUID> {

    Optional<Submission> findByIdAndUserId(UUID id, UUID userId);

    Page<Submission> findByUserIdOrderBySubmittedAtDesc(UUID userId, Pageable pageable);

    List<Submission> findByStatusAndStartedAtBefore(SubmissionStatus status, Instant startedAt);
}
