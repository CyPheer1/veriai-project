You are a senior full-stack engineer. Your task is to build a complete,
production-ready backend for an AI text detection application called
"VeriAI". The frontend already exists and is fully built in React.
Your job is to build everything behind it so the full application works
end-to-end without any errors.

Before writing a single line of code, read everything in this prompt
carefully. Understand the full picture first, then build it.

═══════════════════════════════════════════════════════════════════
SECTION 1 — WHAT ALREADY EXISTS (DO NOT TOUCH)
═══════════════════════════════════════════════════════════════════

The frontend is a React application already built and running.
It is the VeriAI interface — a dark-themed AI text detection tool.
It has the following pages and features already implemented:

- A landing page with a hero section, features, pricing, and footer
- An analyze page where users paste text or upload files
- A results page showing a confidence gauge, model attribution bars,
  semantic breakdown with colored sentence highlighting, and
  stylistic feature statistics
- A submissions history page
- A pricing page with free and pro tiers
- An API documentation page
- Authentication pages for login and registration

The frontend already makes HTTP calls to a backend.
Your job is to build that backend so every call works correctly.

Do not modify the frontend. Read its API calls carefully and
build a backend that matches them exactly.

═══════════════════════════════════════════════════════════════════
SECTION 2 — THE AI MODEL (ALREADY TRAINED)
═══════════════════════════════════════════════════════════════════

The AI model is already fine-tuned and published on HuggingFace at:
https://huggingface.co/mehddii/roberta-aigt-finetuning-v4

It is a RoBERTa-base model fine-tuned for binary classification:

- Label 0 = Human-written text
- Label 1 = AI-generated text

It outputs a probability score between 0 and 1 for each class.
You must load this model from HuggingFace using the transformers
library. The model must be loaded once at application startup and
reused for every request — never reload it per request.

═══════════════════════════════════════════════════════════════════
SECTION 3 — OVERALL ARCHITECTURE
═══════════════════════════════════════════════════════════════════

The system has three layers that must all work together:

LAYER 1 — React Frontend (already exists, port 3000)
Communicates with Spring Boot via REST API calls with JSON.
Sends JWT token in Authorization header for protected routes.

LAYER 2 — Spring Boot Backend (you build this, port 8080)
Handles all user-facing concerns: authentication, user management,
quota enforcement, submission tracking, and result retrieval.
It does not perform any AI inference.
When a submission is received, Spring Boot saves it to PostgreSQL
and then calls FastAPI internally to trigger AI processing.
It exposes all REST endpoints that the React frontend calls.

LAYER 3 — FastAPI AI Service (you build this, port 8000)
Handles all AI concerns: loading the HuggingFace model, chunking
text, running inference, computing stylistic features, and saving
results back to PostgreSQL.
It is only called internally by Spring Boot.
It is never called directly by the React frontend.
It uses Celery with Redis as a message broker to process
submissions asynchronously so the system never blocks.

All three layers run inside Docker containers managed by
Docker Compose. The entire system starts with one command.

═══════════════════════════════════════════════════════════════════
SECTION 4 — SPRING BOOT BACKEND REQUIREMENTS
═══════════════════════════════════════════════════════════════════

Technology stack:
Spring Boot 3, Java 21, Spring Security, Spring Data JPA,
PostgreSQL, JWT authentication, Spring Actuator for Prometheus
metrics, Swagger for API documentation.

Authentication system:
Implement full JWT-based authentication with register and login
endpoints. Passwords must be hashed with BCrypt.
JWT tokens must expire after 24 hours.
Protected endpoints require a valid token in the Authorization header.

User model must include: id, email, password, plan (FREE or PRO),
daily submission count, last submission date, created at timestamp.

Quota enforcement:
Free plan users are limited to 3 submissions per day.
Pro plan users have unlimited submissions.
The daily count resets at midnight.
When a user exceeds their quota, return HTTP 429 with a clear
error message explaining the limit.

Submission lifecycle:
When a user submits text or a file, Spring Boot must:
save the submission to PostgreSQL with status PENDING,
return HTTP 202 immediately with the submission ID,
then call FastAPI asynchronously to trigger processing.
The frontend polls for results — Spring Boot must return the
current status and full results when ready.

Submission statuses are: PENDING, PROCESSING, COMPLETED, ERROR.

File handling:
Accept PDF and DOCX uploads for Pro plan users.
Extract plain text from these files before sending to FastAPI.
Reject files larger than 10MB with a clear error.

All REST endpoints must match exactly what the React frontend
expects. Inspect the frontend API calls carefully and build
endpoints that satisfy them without any mismatch in URL, method,
request body, or response structure.

Expose Prometheus metrics at the actuator endpoint so Grafana
can scrape them.

═══════════════════════════════════════════════════════════════════
SECTION 5 — FASTAPI AI SERVICE REQUIREMENTS
═══════════════════════════════════════════════════════════════════

Technology stack:
Python 3.11, FastAPI, Celery, Redis, HuggingFace Transformers,
PyTorch, scikit-learn, spaCy, NLTK, SQLAlchemy, psycopg2.

Model loading:
Load the model from HuggingFace Hub at startup using:
mehddii/roberta-aigt-finetuning-v4
Load it once and keep it in memory.
Use CUDA if available, otherwise CPU.

Text processing pipeline:
When a submission is received, the service must:

First, perform semantic chunking on the text.
Split the text into chunks of 120 to 512 words,
respecting natural boundaries like paragraph breaks and sentence
endings. Never split in the middle of a sentence.
Each chunk must have at least 50 words to be processed.

Second, run three detection layers on each chunk:

Layer 1 is the main RoBERTa classifier.
Tokenize the chunk with max length 512, run inference,
and return the AI probability score.

Layer 2 is stylistic analysis.
Extract these linguistic features from each chunk:
type-token ratio, average sentence length, sentence length
variance, burstiness score, logical connector ratio,
punctuation patterns, and information variance.
Train a lightweight logistic regression classifier on these
features to produce an AI probability score.
Use scikit-learn for this.

Layer 3 is statistical analysis.
Load GPT-2 Medium as a proxy model.
Compute perplexity, average token entropy, mean log rank,
and probability curvature for each chunk.
Low perplexity indicates AI-generated text.
Combine these into a statistical AI score.

Third, combine the three layer scores using weighted averaging:
Layer 1 contributes 60 percent of the final score.
Layer 2 contributes 20 percent.
Layer 3 contributes 20 percent.

For quick mode (free plan), run only Layer 1.
For full mode (pro plan), run all three layers.

Fourth, aggregate chunk scores into a global document score
by averaging all chunk scores.

Fifth, compute model attribution probabilities.
Based on the score and layer patterns, estimate which AI model
likely generated the text. Return probabilities for
GPT-4 Turbo, Claude 3 Opus, Gemini 1.5 Pro, and Llama 3 70B.

Sixth, save the complete result to PostgreSQL.

The result saved to PostgreSQL must include:
global label (ai or human),
global confidence score (0 to 1),
score for each layer,
per-chunk results with label, confidence, and text,
model attribution dictionary,
all stylistic features,
is_reliable flag (true if text has more than 120 words).

Asynchronous processing:
All processing must happen inside a Celery task, not in the
FastAPI request handler. The FastAPI endpoint only enqueues
the task and returns immediately.
Configure Celery with Redis as broker.
Configure automatic retry with exponential backoff on failure.
Maximum 3 retries per task.

A Celery Beat scheduler must run a periodic task every 10 minutes
to find submissions stuck in PROCESSING status for more than
30 minutes and either complete them or requeue their chunks.

Expose a health endpoint and a metrics endpoint compatible
with Prometheus scraping using the prometheus-client library.

═══════════════════════════════════════════════════════════════════
SECTION 6 — DATABASE SCHEMA
═══════════════════════════════════════════════════════════════════

Use PostgreSQL for all persistence.
Both Spring Boot and FastAPI connect to the same database instance.
Spring Boot manages the user and submission tables via JPA.
FastAPI reads submissions and writes results via SQLAlchemy.

Design the schema to support all the features described above.
The schema must handle users, submissions, chunk-level results,
and support efficient querying by user, by status, and by date.

═══════════════════════════════════════════════════════════════════
SECTION 7 — DOCKER COMPOSE REQUIREMENTS
═══════════════════════════════════════════════════════════════════

All services must be containerized and orchestrated with
Docker Compose. The entire system must start with:
docker compose up --build

Services to include:
the React frontend,
the Spring Boot backend,
the FastAPI AI service,
one or more Celery detection workers (scalable),
a Celery Beat scheduler,
Redis,
PostgreSQL with a persistent volume,
Prometheus with a configuration file,
Grafana connected to Prometheus.

The detection worker must be scalable with:
docker compose up --scale detection-worker=3

Only the React frontend port 3000 and the Spring Boot port 8080
should be accessible from outside. All other services communicate
on an internal Docker network only.

Model files must be stored in a named Docker volume so they
persist across container restarts without re-downloading.

An environment file must centralize all configuration:
database credentials, JWT secret, Redis URL, HuggingFace model
name, quota limits, and any other parameters.

═══════════════════════════════════════════════════════════════════
SECTION 8 — RESPONSE FORMAT REQUIREMENTS
═══════════════════════════════════════════════════════════════════

The analyze endpoint must return a response that the React
frontend can directly consume to render:
the confidence gauge showing global AI probability,
the model attribution bars showing probabilities per model,
the semantic breakdown section showing each chunk with its label
and a color indicating human or AI,
the stylistic features statistics,
the per-layer score breakdown,
the is_reliable flag,
the word count,
the submission timestamp.

Make sure every field the frontend expects is present in every
response. Missing fields will cause the UI to break.

═══════════════════════════════════════════════════════════════════
SECTION 9 — QUALITY REQUIREMENTS
═══════════════════════════════════════════════════════════════════

The code must be production-quality with proper separation of
concerns. No business logic in controllers. No database queries
in task handlers. No hardcoded values — everything comes from
environment variables.

Every endpoint must have proper error handling that returns
meaningful HTTP status codes and error messages the frontend
can display to users.

All services must have health check endpoints.

Logging must be structured and consistent across all services.
Every request, task, and error must be logged with enough
context to debug issues.

CORS must be configured on Spring Boot to allow requests from
the React frontend origin.

The system must handle concurrent submissions gracefully.
Multiple users submitting at the same time must not interfere
with each other.

**═══════════════════════════════════════════════════════════════════**
SECTION 10 — DELIVERABLES & EXECUTION PLAN
═══════════════════════════════════════════════════════════════════

**Do not deliver partial code, placeholder functions, or TODO comments. Every function must be fully implemented.**

**Because this is a large project, do NOT try to output everything in one single response to avoid token limits. Let's build it STEP BY STEP.**

**STEP 1: Start by planning the file structure, implementing the PostgreSQL Database Schema, and the docker-compose.yml. Ask for my confirmation before proceeding to step 2.**

**STEP 2: Implement the complete Spring Boot Backend (Controllers, Services, Security, JPA). Ask for my confirmation before proceeding.**

**STEP 3: Implement the complete FastAPI AI Service (including Celery tasks and HuggingFace models integration).**

**Work sequentially. Begin with STEP 1 now.**
