from __future__ import annotations

import logging

from celery import Celery
from celery.signals import worker_process_init

from app.core.config import get_settings
from app.core.metrics import MODEL_READY

logger = logging.getLogger(__name__)
settings = get_settings()

celery_app = Celery(
    "veriai_detection",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["celery_app.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    beat_schedule={
        "watchdog-stuck-submissions": {
            "task": "celery_app.tasks.watchdog_stuck_submissions",
            "schedule": settings.celery_watchdog_schedule_seconds,
        }
    },
)


@worker_process_init.connect
def warm_models(**_kwargs):
    try:
        from app.ml.pipeline import get_analysis_pipeline

        pipeline = get_analysis_pipeline()
        pipeline.load_models()
        MODEL_READY.set(1)
        logger.info("Worker process initialized with loaded models")
    except Exception:
        MODEL_READY.set(0)
        logger.exception("Worker failed to preload models")
