from __future__ import annotations

import datetime as dt
import logging
from time import perf_counter
from uuid import UUID

from celery import Task

from app.core.config import get_settings
from app.core.metrics import TASK_DURATION_SECONDS, TASK_FAILURE_COUNT, TASK_SUCCESS_COUNT
from app.ml.pipeline import get_analysis_pipeline
from app.services.submission_processing_service import (
    mark_submission_error,
    persist_submission_analysis,
    prepare_submission_for_processing,
    recover_stuck_submissions,
)
from celery_app.celery_app import celery_app

logger = logging.getLogger(__name__)
settings = get_settings()


@celery_app.task(
    bind=True,
    name="celery_app.tasks.process_submission_task",
    max_retries=settings.celery_task_max_retries,
)
def process_submission_task(
    self: Task,
    submission_id: str,
    mode: str = "QUICK",
    plan: str = "FREE",
    word_count: int = 0,
) -> dict:
    del plan, word_count

    started = perf_counter()

    try:
        submission_uuid = UUID(submission_id)
    except ValueError as exc:
        TASK_FAILURE_COUNT.inc()
        raise ValueError(f"Invalid submission id: {submission_id}") from exc

    try:
        prepared_submission = prepare_submission_for_processing(submission_uuid, fallback_mode=mode)
        if prepared_submission is None:
            logger.warning("Submission %s not found", submission_id)
            return {"status": "missing", "submission_id": submission_id}

        text, processing_mode = prepared_submission

        pipeline = get_analysis_pipeline()
        analysis = pipeline.analyze_document(text, processing_mode or mode)

        if not persist_submission_analysis(submission_uuid, analysis):
            logger.warning("Submission %s disappeared before persist", submission_id)
            return {"status": "missing", "submission_id": submission_id}

        TASK_SUCCESS_COUNT.inc()
        TASK_DURATION_SECONDS.observe(perf_counter() - started)
        return {"status": "completed", "submission_id": submission_id}

    except Exception as exc:
        TASK_FAILURE_COUNT.inc()
        logger.exception("Task failed for submission %s", submission_id)

        retries = int(getattr(self.request, "retries", 0))
        max_retries = int(settings.celery_task_max_retries)

        if retries < max_retries:
            countdown = max(1, int(settings.celery_retry_backoff_base)) ** retries
            raise self.retry(exc=exc, countdown=countdown)

        mark_submission_error(submission_uuid, str(exc))
        raise


@celery_app.task(name="celery_app.tasks.watchdog_stuck_submissions")
def watchdog_stuck_submissions() -> dict:
    now = dt.datetime.now(dt.timezone.utc)
    threshold = now - dt.timedelta(minutes=int(settings.celery_watchdog_stuck_minutes))
    completed, requeue_payloads = recover_stuck_submissions(threshold)

    for payload in requeue_payloads:
        process_submission_task.delay(*payload)

    return {
        "checked": len(requeue_payloads) + completed,
        "completed": completed,
        "requeued": len(requeue_payloads),
    }
