package com.example.backendjava.repository;

import com.example.backendjava.entity.SubmissionResult;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionResultRepository extends JpaRepository<SubmissionResult, UUID> {
}
