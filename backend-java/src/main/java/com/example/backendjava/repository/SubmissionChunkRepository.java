package com.example.backendjava.repository;

import com.example.backendjava.entity.SubmissionChunk;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionChunkRepository extends JpaRepository<SubmissionChunk, Long> {

    List<SubmissionChunk> findBySubmissionIdOrderByChunkIndexAsc(UUID submissionId);

    void deleteBySubmissionId(UUID submissionId);
}
