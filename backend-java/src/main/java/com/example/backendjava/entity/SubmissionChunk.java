package com.example.backendjava.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "submission_chunks",
        uniqueConstraints = @UniqueConstraint(name = "uk_submission_chunk_index", columnNames = {"submission_id", "chunk_index"})
)
public class SubmissionChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Column(name = "chunk_text", nullable = false, columnDefinition = "TEXT")
    private String chunkText;

    @Column(name = "word_count", nullable = false)
    private Integer wordCount;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "label", nullable = false, columnDefinition = "result_label")
    private ResultLabel label;

    @Column(name = "confidence", nullable = false, precision = 5, scale = 4)
    private BigDecimal confidence;

    @Column(name = "layer1_score", precision = 5, scale = 4)
    private BigDecimal layer1Score;

    @Column(name = "layer2_score", precision = 5, scale = 4)
    private BigDecimal layer2Score;

    @Column(name = "layer3_score", precision = 5, scale = 4)
    private BigDecimal layer3Score;

    @Column(name = "stylistic_features", nullable = false, columnDefinition = "jsonb")
    private String stylisticFeatures;

    @Column(name = "statistical_features", nullable = false, columnDefinition = "jsonb")
    private String statisticalFeatures;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
