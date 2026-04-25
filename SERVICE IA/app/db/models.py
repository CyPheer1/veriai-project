import datetime as dt
import uuid

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ENUM as PGEnum
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

USER_PLAN_ENUM = PGEnum("FREE", "PRO", name="user_plan", create_type=False)
SUBMISSION_SOURCE_TYPE_ENUM = PGEnum("TEXT", "PDF", "DOCX", name="submission_source_type", create_type=False)
PROCESSING_MODE_ENUM = PGEnum("QUICK", "FULL", name="processing_mode", create_type=False)
SUBMISSION_STATUS_ENUM = PGEnum("PENDING", "PROCESSING", "COMPLETED", "ERROR", name="submission_status", create_type=False)
RESULT_LABEL_ENUM = PGEnum("ai", "human", name="result_label", create_type=False)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    plan: Mapped[str] = mapped_column(USER_PLAN_ENUM, nullable=False)
    daily_submission_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_submission_date: Mapped[dt.date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    source_type: Mapped[str] = mapped_column(SUBMISSION_SOURCE_TYPE_ENUM, nullable=False)
    source_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    original_text: Mapped[str] = mapped_column(Text, nullable=False)
    processing_mode: Mapped[str] = mapped_column(PROCESSING_MODE_ENUM, nullable=False)
    status: Mapped[str] = mapped_column(SUBMISSION_STATUS_ENUM, nullable=False)
    word_count: Mapped[int] = mapped_column(Integer, nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    submitted_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    started_at: Mapped[dt.datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[dt.datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class SubmissionResult(Base):
    __tablename__ = "submission_results"

    submission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("submissions.id", ondelete="CASCADE"),
        primary_key=True,
    )
    global_label: Mapped[str] = mapped_column(RESULT_LABEL_ENUM, nullable=False)
    global_confidence: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)
    layer1_score: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    layer2_score: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    layer3_score: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    model_attribution: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    stylistic_features: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    statistical_features: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    is_reliable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class SubmissionChunk(Base):
    __tablename__ = "submission_chunks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    submission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("submissions.id", ondelete="CASCADE"),
        nullable=False,
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    word_count: Mapped[int] = mapped_column(Integer, nullable=False)
    label: Mapped[str] = mapped_column(RESULT_LABEL_ENUM, nullable=False)
    confidence: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)
    layer1_score: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    layer2_score: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    layer3_score: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    stylistic_features: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    statistical_features: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
