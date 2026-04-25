# VeriAI - STEP 1 File Structure Plan

This document defines the target production structure used to implement the backend and AI pipeline in sequential steps.

## Existing folders kept as-is

- `frontend/` (already built, must not be modified)
- `backend-java/` (Spring Boot service, implementation in STEP 2)
- `SERVICE IA/` (FastAPI + Celery service, implementation in STEP 3)

## Added infrastructure folders in STEP 1

- `infra/postgres/init/` for PostgreSQL bootstrap SQL
- `infra/prometheus/` for Prometheus scrape configuration
- root `.env` and `.env.example` for centralized configuration
- root `docker-compose.yml` for service orchestration

## Target architecture map

```text
veriai-project/
├── backend-java/
│   ├── src/main/java/...                       # Spring API, security, services (STEP 2)
│   └── src/main/resources/...                  # application properties, actuator config (STEP 2)
├── SERVICE IA/
│   ├── app/                                    # FastAPI application package (STEP 3)
│   ├── celery_app/                             # Celery worker/beat setup (STEP 3)
│   ├── requirements.txt                        # Python dependencies (STEP 3)
│   └── Dockerfile                              # AI service image (STEP 3)
├── frontend/                                   # Existing React UI (unchanged)
├── infra/
│   ├── postgres/
│   │   └── init/
│   │       └── 001_schema.sql                  # Initial DB schema (STEP 1)
│   └── prometheus/
│       └── prometheus.yml                      # Prometheus jobs (STEP 1)
├── docker-compose.yml                          # Full multi-service orchestration (STEP 1)
├── .env                                        # Active local development environment values (STEP 1)
├── .env.example                                # Safe template values (STEP 1)
└── docs/
    └── step1-file-structure.md                 # This plan
```

## Service responsibility boundaries

- Spring Boot owns authentication, quota policy, submission lifecycle, and frontend-facing APIs.
- FastAPI + Celery owns AI processing, chunk-level scoring, and writing detailed result payloads.
- PostgreSQL stores users, submissions, aggregated results, and chunk-level outputs.
- Redis is used as Celery broker/backend.
- Prometheus and Grafana provide observability.

## Network and exposure policy

- Public host ports: `3000` (frontend), `8080` (backend).
- Internal-only services: PostgreSQL, Redis, FastAPI, Celery worker, Celery beat, Prometheus, Grafana.

## Notes for next steps

- STEP 2 will fully implement Spring Boot entities, repositories, controllers, JWT security, and API contracts.
- STEP 3 will fully implement FastAPI inference pipeline, Celery tasks, and result persistence.
