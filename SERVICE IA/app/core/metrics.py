from prometheus_client import Counter, Gauge, Histogram

HTTP_REQUEST_COUNT = Counter(
    "veriai_ai_http_requests_total",
    "Total HTTP requests served by the AI service",
    ["method", "path", "status"],
)

HTTP_REQUEST_LATENCY = Histogram(
    "veriai_ai_http_request_latency_seconds",
    "Latency of HTTP requests served by the AI service",
    ["method", "path"],
)

ENQUEUE_COUNT = Counter(
    "veriai_ai_enqueue_total",
    "Total submissions enqueued for async processing",
)

TASK_SUCCESS_COUNT = Counter(
    "veriai_ai_task_success_total",
    "Total successful analysis tasks",
)

TASK_FAILURE_COUNT = Counter(
    "veriai_ai_task_failure_total",
    "Total failed analysis tasks",
)

TASK_DURATION_SECONDS = Histogram(
    "veriai_ai_task_duration_seconds",
    "Duration of analysis tasks",
)

MODEL_READY = Gauge(
    "veriai_ai_model_ready",
    "Whether the detection models are loaded (1) or not (0)",
)
