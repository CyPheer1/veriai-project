package com.example.backendjava.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
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
@Table(name = "submission_results")
public class SubmissionResult {

    @Id
    @Column(name = "submission_id")
    private UUID submissionId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "global_label", nullable = false, columnDefinition = "result_label")
    private ResultLabel globalLabel;

    @Column(name = "global_confidence", nullable = false, precision = 5, scale = 4)
    private BigDecimal globalConfidence;

    @Column(name = "layer1_score", precision = 5, scale = 4)
    private BigDecimal layer1Score;

    @Column(name = "layer2_score", precision = 5, scale = 4)
    private BigDecimal layer2Score;

    @Column(name = "layer3_score", precision = 5, scale = 4)
    private BigDecimal layer3Score;

    @Column(name = "model_attribution", nullable = false, columnDefinition = "jsonb")
    private String modelAttribution;

    @Column(name = "stylistic_features", nullable = false, columnDefinition = "jsonb")
    private String stylisticFeatures;

    @Column(name = "statistical_features", nullable = false, columnDefinition = "jsonb")
    private String statisticalFeatures;

    @Column(name = "is_reliable", nullable = false)
    private Boolean isReliable;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
