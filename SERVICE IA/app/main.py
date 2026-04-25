from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from time import perf_counter

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.core.config import get_settings
from app.core.logging_config import configure_logging
from app.core.metrics import HTTP_REQUEST_COUNT, HTTP_REQUEST_LATENCY, MODEL_READY
from app.ml.pipeline import get_analysis_pipeline

configure_logging()
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Load AI models at startup, clean up on shutdown."""
    pipeline = get_analysis_pipeline()
    if settings.load_models_on_startup:
        try:
            pipeline.load_models()
            MODEL_READY.set(1)
            logger.info("Models loaded at FastAPI startup")
        except Exception:
            MODEL_READY.set(0)
            logger.exception("Model loading failed during startup")
    else:
        MODEL_READY.set(0)
        logger.info("Model loading on startup disabled")

    yield  # Application runs here

    logger.info("AI service shutting down")


app = FastAPI(
    title="VeriAI AI Service",
    version="1.0.0",
    description="FastAPI service handling async AI text detection tasks",
    lifespan=lifespan,
)
app.include_router(router)


@app.middleware("http")
async def http_metrics_middleware(request: Request, call_next):
    start = perf_counter()
    path = request.url.path
    method = request.method

    try:
        response = await call_next(request)
        status_code = response.status_code
    except Exception:
        status_code = 500
        HTTP_REQUEST_COUNT.labels(method=method, path=path, status=str(status_code)).inc()
        HTTP_REQUEST_LATENCY.labels(method=method, path=path).observe(perf_counter() - start)
        raise

    HTTP_REQUEST_COUNT.labels(method=method, path=path, status=str(status_code)).inc()
    HTTP_REQUEST_LATENCY.labels(method=method, path=path).observe(perf_counter() - start)
    return response


@app.get("/")
def root() -> JSONResponse:
    return JSONResponse({"service": "veriai-ai-service", "status": "running"})

