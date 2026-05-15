#!/usr/bin/env bash
set -euo pipefail

PORT=${PORT:-8080}

celery -A celery_app.celery_app:celery_app beat --loglevel=INFO &
beat_pid=$!

python -m http.server "$PORT" --bind 0.0.0.0 &
http_pid=$!

wait -n "$beat_pid" "$http_pid"
exit $?
