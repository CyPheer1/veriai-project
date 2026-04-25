from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Header, HTTPException, Response
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

from app.core.config import get_settings
from app.core.metrics import ENQUEUE_COUNT, MODEL_READY
from app.ml.pipeline import get_analysis_pipeline
from app.schemas.requests import FastApiDispatchRequest
from app.schemas.responses import EnqueueResponse, HealthResponse
from celery_app.tasks import process_submission_task

router = APIRouter()
settings = get_settings()


def _validate_internal_token(x_internal_token: str | None) -> None:
    if x_internal_token != settings.internal_service_token:
        raise HTTPException(status_code=401, detail="Invalid internal service token")


@router.post("/internal/v1/analyze", response_model=EnqueueResponse)
def enqueue_analysis(
    payload: FastApiDispatchRequest,
    x_internal_token: Annotated[str | None, Header(alias="X-Internal-Token")] = None,
) -> EnqueueResponse:
    _validate_internal_token(x_internal_token)

    task = process_submission_task.delay(
        str(payload.submission_id),
        payload.mode,
        payload.plan,
        payload.word_count,
    )
    ENQUEUE_COUNT.inc()

    return EnqueueResponse(taskId=task.id, submissionId=payload.submission_id, status="queued")


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    pipeline = get_analysis_pipeline()
    if pipeline.loaded:
        MODEL_READY.set(1)
    return HealthResponse(
        status="ok",
        models_loaded=pipeline.loaded,
        device=pipeline.device_name,
    )


@router.get("/metrics")
def metrics() -> Response:
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
