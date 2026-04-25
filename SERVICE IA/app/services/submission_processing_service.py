from __future__ import annotations

import datetime as dt
from uuid import UUID

from sqlalchemy import delete, select

from app.db.database import session_scope
from app.db.models import Submission, SubmissionChunk, SubmissionResult, User


def _utc_now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def _truncate_error(message: str, max_len: int = 1000) -> str:
    if len(message) <= max_len:
        return message
    return message[: max_len - 3] + "..."


def _to_float(value: float | int | None) -> float | None:
    if value is None:
        return None
    return float(value)


def prepare_submission_for_processing(submission_id: UUID, fallback_mode: str) -> tuple[str, str] | None:
    with session_scope() as session:
        submission = session.get(Submission, submission_id)
        if submission is None:
            return None

        now = _utc_now()
        submission.status = "PROCESSING"
        submission.started_at = submission.started_at or now
        submission.error_message = None
        submission.updated_at = now

        return submission.original_text, submission.processing_mode or fallback_mode


def persist_submission_analysis(submission_id: UUID, analysis: dict) -> bool:
    finished = _utc_now()

    with session_scope() as session:
        submission = session.get(Submission, submission_id)
        if submission is None:
            return False

        existing = session.get(SubmissionResult, submission_id)
        if existing is None:
            existing = SubmissionResult(
                submission_id=submission_id,
                created_at=finished,
            )

        existing.global_label = analysis["global_label"]
        existing.global_confidence = _to_float(analysis["global_confidence"])
        existing.layer1_score = _to_float(analysis["layer1_score"])
        existing.layer2_score = _to_float(analysis["layer2_score"])
        existing.layer3_score = _to_float(analysis["layer3_score"])
        existing.model_attribution = analysis["model_attribution"]
        existing.stylistic_features = analysis["stylistic_features"]
        existing.statistical_features = analysis["statistical_features"]
        existing.is_reliable = bool(analysis["is_reliable"])
        existing.updated_at = finished

        session.add(existing)
        session.execute(delete(SubmissionChunk).where(SubmissionChunk.submission_id == submission_id))

        for chunk in analysis["chunks"]:
            session.add(
                SubmissionChunk(
                    submission_id=submission_id,
                    chunk_index=int(chunk["chunk_index"]),
                    chunk_text=chunk["chunk_text"],
                    word_count=int(chunk["word_count"]),
                    label=chunk["label"],
                    confidence=_to_float(chunk["confidence"]),
                    layer1_score=_to_float(chunk["layer1_score"]),
                    layer2_score=_to_float(chunk["layer2_score"]),
                    layer3_score=_to_float(chunk["layer3_score"]),
                    stylistic_features=chunk["stylistic_features"],
                    statistical_features=chunk["statistical_features"],
                    created_at=finished,
                )
            )

        submission.status = "COMPLETED"
        submission.error_message = None
        submission.completed_at = finished
        submission.updated_at = finished

    return True


def mark_submission_error(submission_id: UUID, message: str) -> None:
    now = _utc_now()
    with session_scope() as session:
        submission = session.get(Submission, submission_id)
        if submission is None:
            return

        submission.status = "ERROR"
        submission.error_message = _truncate_error(message)
        submission.completed_at = now
        submission.updated_at = now


def recover_stuck_submissions(stuck_before: dt.datetime) -> tuple[int, list[tuple[str, str, str, int]]]:
    now = _utc_now()
    requeue_payloads: list[tuple[str, str, str, int]] = []
    completed = 0

    with session_scope() as session:
        stuck_submissions = list(
            session.execute(
                select(Submission).where(
                    Submission.status == "PROCESSING",
                    Submission.started_at.is_not(None),
                    Submission.started_at < stuck_before,
                )
            ).scalars()
        )

        for submission in stuck_submissions:
            has_result = session.get(SubmissionResult, submission.id) is not None
            if has_result:
                submission.status = "COMPLETED"
                submission.completed_at = now
                submission.error_message = None
                submission.updated_at = now
                completed += 1
            else:
                submission.status = "PENDING"
                submission.updated_at = now
                user_plan = "FREE"
                user = session.get(User, submission.user_id)
                if user is not None and user.plan:
                    user_plan = str(user.plan)
                requeue_payloads.append(
                    (
                        str(submission.id),
                        submission.processing_mode,
                        user_plan,
                        int(submission.word_count or 0),
                    )
                )

    return completed, requeue_payloads
