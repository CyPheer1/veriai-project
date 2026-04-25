# VeriAI — Documentation Complète du Projet

## 1. Objectif du Projet

**VeriAI** est une application web de **détection de texte généré par IA**. Elle permet aux utilisateurs de :

- Coller du texte ou uploader un fichier (PDF/DOCX)
- Analyser le texte via un modèle RoBERTa fine-tuné + analyses stylistiques et statistiques
- Obtenir un score de confiance (humain vs IA), une attribution par modèle (GPT-4, Claude, Gemini, Llama), et un découpage sémantique coloré phrase par phrase

Le système utilise **3 couches de détection** :
- **Layer 1** : Classifieur RoBERTa (`mehddii/roberta-aigt-finetuning-v4`) — 60% du score
- **Layer 2** : Analyse stylistique (régression logistique sur 7 features linguistiques) — 20%
- **Layer 3** : Analyse statistique (perplexité GPT-2 Medium, entropie, log-rank) — 20%

---

## 2. Architecture Générale

```
┌──────────────┐     REST/JWT      ┌──────────────────┐    Internal HTTP    ┌─────────────────┐
│   Frontend   │ ───────────────▶  │  Spring Boot     │ ─────────────────▶  │  FastAPI         │
│   React      │ ◀───────────────  │  Backend (8080)  │ ◀─────────────────  │  AI Service      │
│   (port 3000)│     JSON          │  Auth, Quotas,   │    X-Internal-Token │  (port 8000)     │
└──────────────┘                   │  Submissions     │                     └────────┬──────────┘
                                   └────────┬─────────┘                              │
                                            │                                        │ Celery task
                                            │ JPA                                    ▼
                                   ┌────────▼─────────┐                     ┌─────────────────┐
                                   │   PostgreSQL     │ ◀────SQLAlchemy──── │  Celery Worker   │
                                   │   (port 5432)    │                     │  (Detection)     │
                                   └──────────────────┘                     └────────┬──────────┘
                                                                                     │
                                                                            ┌────────▼──────────┐
                                                                            │   Redis            │
                                                                            │   (Broker, 6379)   │
                                                                            └───────────────────┘
```

**Monitoring** : Prometheus scrape les métriques → Grafana les affiche.

---

## 3. Structure des Fichiers

```
veriai-project/
├── frontend/                    # React (existant, ne pas modifier)
├── backend-java/                # Spring Boot 3 + Java 21
│   ├── src/main/java/com/example/backendjava/
│   │   ├── BackendJavaApplication.java   # Point d'entrée
│   │   ├── config/                       # SecurityConfig, AppProperties, AsyncConfig, CORS
│   │   ├── controller/                   # AuthController, SubmissionController
│   │   │   └── internal/                 # InternalSubmissionController (appelé par FastAPI)
│   │   ├── dto/                          # Request/Response records (auth, submission, internal)
│   │   ├── entity/                       # User, Submission, SubmissionResult, SubmissionChunk
│   │   ├── exception/                    # GlobalExceptionHandler, ApiException
│   │   ├── mapper/                       # SubmissionResponseMapper
│   │   ├── repository/                   # JPA repositories
│   │   ├── security/                     # JwtService, JwtAuthenticationFilter
│   │   └── service/                      # AuthService, SubmissionService, QuotaService, etc.
│   ├── src/main/resources/
│   │   ├── application.properties        # Config Spring (env-driven)
│   │   └── application-docker.properties
│   └── pom.xml                           # Dépendances Maven
├── SERVICE IA/                  # FastAPI + Celery (Python 3.11)
│   ├── app/
│   │   ├── main.py                       # Point d'entrée FastAPI + lifespan
│   │   ├── api/routes.py                 # POST /internal/v1/analyze, GET /health, GET /metrics
│   │   ├── core/
│   │   │   ├── config.py                 # Settings Pydantic (env vars)
│   │   │   ├── metrics.py                # Compteurs Prometheus
│   │   │   └── logging_config.py         # Config logging
│   │   ├── db/
│   │   │   ├── database.py               # SQLAlchemy engine + session
│   │   │   └── models.py                 # ORM models (mirroring du schema SQL)
│   │   ├── ml/
│   │   │   ├── pipeline.py               # AnalysisPipeline (orchestre les 3 layers)
│   │   │   ├── roberta_detector.py       # Layer 1 : RoBERTa classifier
│   │   │   ├── stylistic.py              # Layer 2 : Features linguistiques + LogReg
│   │   │   ├── statistical.py            # Layer 3 : GPT-2 perplexité/entropie
│   │   │   ├── chunking.py               # Découpage sémantique du texte
│   │   │   └── attribution.py            # Attribution par modèle IA (GPT-4, Claude, etc.)
│   │   ├── schemas/                      # Pydantic request/response
│   │   └── services/
│   │       └── submission_processing_service.py  # CRUD PostgreSQL pour résultats
│   ├── celery_app/
│   │   ├── celery_app.py                 # Config Celery + Beat schedule
│   │   └── tasks.py                      # process_submission_task + watchdog
│   ├── requirements.txt
│   └── Dockerfile
├── infra/
│   ├── postgres/init/001_schema.sql      # Schema SQL (tables + enums + indexes + triggers)
│   ├── prometheus/prometheus.yml         # Scrape config
│   └── grafana/provisioning/datasources/ # Auto-provision Prometheus datasource
├── docker-compose.yml                    # 9 services orchestrés
├── .env                                  # Variables d'environnement centralisées
└── .env.example                          # Template safe
```

---

## 4. Détail de Chaque Composant

### 4.1 Frontend (React — Port 3000)

**Déjà construit**, ne pas modifier. Contient :
- Landing page, page d'analyse, page de résultats
- Historique des soumissions, pricing, documentation API
- Login/Register
- Appels HTTP vers `http://localhost:8080/api/v1/...` avec JWT dans `Authorization: Bearer <token>`

### 4.2 Spring Boot Backend (Java — Port 8080)

**Rôle** : Gère tout ce qui est user-facing.

| Fonctionnalité | Endpoint | Détails |
|---|---|---|
| Inscription | `POST /api/v1/auth/register` | BCrypt, retourne JWT (24h) |
| Connexion | `POST /api/v1/auth/login` | Vérifie credentials, retourne JWT |
| Profil | `GET /api/v1/auth/me` | Infos user connecté |
| Soumettre texte | `POST /api/v1/submissions/text` | Retourne 202 + submission ID |
| Soumettre fichier | `POST /api/v1/submissions/file` | PDF/DOCX, PRO only, max 10MB |
| Détail soumission | `GET /api/v1/submissions/{id}` | Status + résultats complets |
| Liste soumissions | `GET /api/v1/submissions?page=0&size=20` | Paginé |
| Métriques | `GET /actuator/prometheus` | Pour Prometheus |

**Quota** : FREE = 3 soumissions/jour, PRO = illimité, reset à minuit UTC.

**Flow de soumission** :
1. User envoie texte → Controller reçoit
2. `QuotaService.consumeQuota()` vérifie le quota
3. Submission sauvegardée en DB avec status `PENDING`
4. Retourne HTTP 202 immédiatement
5. `SubmissionDispatchService` (async) appelle FastAPI `POST /internal/v1/analyze`
6. Frontend poll `GET /submissions/{id}` pour obtenir les résultats

### 4.3 FastAPI AI Service (Python — Port 8000)

**Rôle** : Traitement IA uniquement, jamais appelé par le frontend.

| Endpoint | Rôle |
|---|---|
| `POST /internal/v1/analyze` | Reçoit submission de Spring Boot, enqueue Celery task |
| `GET /health` | Status + modèles chargés |
| `GET /metrics` | Métriques Prometheus |

**Pipeline d'analyse** (`pipeline.py`) :
1. **Chunking** : Découpe le texte en morceaux de 120-512 mots (respect des phrases)
2. **Layer 1** : RoBERTa tokenize (max 512 tokens), softmax → probabilité IA
3. **Layer 2** (FULL mode) : Extrait 7 features stylistiques → LogisticRegression → score
4. **Layer 3** (FULL mode) : GPT-2 Medium calcule perplexité, entropie, log-rank → score
5. **Combinaison** : 60% L1 + 20% L2 + 20% L3 (FULL) ou 100% L1 (QUICK)
6. **Agrégation** : Moyenne des scores de tous les chunks → score global
7. **Attribution** : Estime quel modèle IA a généré le texte (GPT-4, Claude, Gemini, Llama)
8. **Sauvegarde** : Résultat complet → PostgreSQL via SQLAlchemy

**Mode QUICK** (FREE) : Layer 1 uniquement  
**Mode FULL** (PRO) : Les 3 layers

### 4.4 Celery Workers + Beat

- **Worker** : Exécute `process_submission_task` → appelle `AnalysisPipeline.analyze_document()`
- **Beat** : Toutes les 10 minutes, `watchdog_stuck_submissions` vérifie les soumissions bloquées en `PROCESSING` depuis > 30 min → les requeue ou complète
- **Retry** : 3 tentatives max avec backoff exponentiel (2^retries secondes)
- **Scalable** : `docker compose up --scale detection-worker=3`

### 4.5 PostgreSQL (Port 5432 interne)

4 tables principales :
- `users` : id, email, password (BCrypt), plan (FREE/PRO), quota journalier
- `submissions` : id, user_id, texte, status (PENDING→PROCESSING→COMPLETED/ERROR), timestamps
- `submission_results` : scores globaux, attribution, features, is_reliable
- `submission_chunks` : résultats par chunk (texte, label, scores par layer)

5 enums PostgreSQL : `user_plan`, `submission_status`, `submission_source_type`, `processing_mode`, `result_label`

### 4.6 Redis (Port 6379 interne)

- **Broker** Celery : File d'attente des tâches
- **Backend** Celery : Stockage des résultats de tâches

### 4.7 Prometheus + Grafana

- **Prometheus** scrape `backend-java:8080/actuator/prometheus` et `ai-service:8000/metrics`
- **Grafana** provisionnée automatiquement avec Prometheus comme datasource

---

## 5. Variables d'Environnement (`.env`)

| Variable | Valeur | Usage |
|---|---|---|
| `POSTGRES_DB/USER/PASSWORD` | veriai / veriai_user / veriai_dev_password | Accès DB |
| `JWT_SECRET` | veriai-dev-jwt-secret-change-in-production | Signature JWT |
| `JWT_EXPIRATION_SECONDS` | 86400 | 24 heures |
| `FREE_PLAN_DAILY_LIMIT` | 3 | Quota FREE |
| `HUGGINGFACE_MODEL_NAME` | mehddii/roberta-aigt-finetuning-v4 | Modèle principal |
| `GPT2_MODEL_NAME` | gpt2-medium | Layer 3 |
| `FULL_MODE_LAYER1/2/3_WEIGHT` | 0.6 / 0.2 / 0.2 | Pondération |
| `INTERNAL_SERVICE_TOKEN` | veriai-dev-internal-token | Auth inter-services |
| `CELERY_BROKER_URL` | redis://redis:6379/0 | Broker |

---

## 6. Comment Lancer le Projet

### Prérequis
- **Docker** et **Docker Compose** installés
- **~5 Go d'espace disque** (modèles HuggingFace + images Docker)
- **Connexion internet** (première fois pour télécharger les modèles)

### Démarrage Complet

```bash
# 1. Se placer dans le dossier du projet
cd veriai-project

# 2. Vérifier que le fichier .env existe
cat .env

# 3. Lancer TOUS les services
docker compose up --build

# 4. Attendre que tout démarre (les modèles AI prennent 2-5 min au premier lancement)
# Chercher dans les logs : "Models loaded at FastAPI startup"
# et "Worker process initialized with loaded models"
```

### Accès
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger-ui.html |

### Tester le Flow Complet

```bash
# 1. Créer un compte
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com", "password":"Test1234!", "plan":"FREE"}'

# 2. Copier le token JWT de la réponse, puis soumettre un texte
curl -X POST http://localhost:8080/api/v1/submissions/text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <VOTRE_TOKEN>" \
  -d '{"text":"Your text to analyze here..."}'

# 3. Récupérer le résultat (remplacer l'ID)
curl http://localhost:8080/api/v1/submissions/<SUBMISSION_ID> \
  -H "Authorization: Bearer <VOTRE_TOKEN>"
```

### Scaler les Workers

```bash
# Lancer 3 workers en parallèle pour plus de performances
docker compose up --scale detection-worker=3
```

### Arrêter

```bash
docker compose down          # Arrêter (garde les volumes)
docker compose down -v       # Arrêter + supprimer les données
```

---

## 7. Flux de Données Complet

```
User tape du texte dans le Frontend
        │
        ▼
POST /api/v1/submissions/text  (avec JWT)
        │
        ▼
Spring Boot :
  ├─ Vérifie JWT → identifie l'utilisateur
  ├─ QuotaService → vérifie quota (FREE: 3/jour)
  ├─ Sauvegarde submission en DB (status = PENDING)
  ├─ Retourne HTTP 202 + submission ID
  └─ @Async → appelle FastAPI POST /internal/v1/analyze
                    │
                    ▼
            FastAPI reçoit la requête
              ├─ Vérifie X-Internal-Token
              └─ process_submission_task.delay() → Redis queue
                            │
                            ▼
                    Celery Worker prend la tâche
                      ├─ Lit le texte depuis PostgreSQL
                      ├─ Status → PROCESSING
                      ├─ Découpe en chunks sémantiques
                      ├─ Pour chaque chunk :
                      │   ├─ Layer 1 : RoBERTa → score IA
                      │   ├─ Layer 2 : Features stylistiques → LogReg score (si FULL)
                      │   └─ Layer 3 : GPT-2 perplexité → score (si FULL)
                      ├─ Combine : 60% L1 + 20% L2 + 20% L3
                      ├─ Moyenne des chunks → score global
                      ├─ Attribution par modèle (GPT-4, Claude, etc.)
                      ├─ Sauvegarde résultats → PostgreSQL
                      └─ Status → COMPLETED
                            │
                            ▼
            Frontend poll GET /submissions/{id}
              └─ Spring Boot lit DB → retourne résultat complet
                    ├─ Score global (gauge)
                    ├─ Attribution par modèle (barres)
                    ├─ Chunks colorés (humain=vert, IA=rouge)
                    ├─ Features stylistiques
                    └─ is_reliable flag
```

---

## 8. Sécurité

| Mesure | Implémentation |
|---|---|
| Mots de passe | BCrypt hash |
| Authentification | JWT (HMAC-SHA256), expire 24h |
| Sessions | Stateless (pas de cookies de session) |
| CORS | Configuré pour `localhost:3000` uniquement |
| Communication interne | `X-Internal-Token` header |
| Quota anti-abus | 3 soumissions/jour FREE, 429 si dépassé |
| Upload | 10MB max, PDF/DOCX uniquement, PRO only |
| Concurrence | Pessimistic lock sur le quota user |
| Erreurs | GlobalExceptionHandler, jamais de stack traces exposées |

---

## 9. Technologies Utilisées

| Composant | Stack |
|---|---|
| Frontend | React, Vite, TailwindCSS |
| Backend | Spring Boot 3.4.5, Java 21, Spring Security, JPA, Lombok |
| AI Service | FastAPI 0.115, Python 3.11, Celery 5.5, Redis 7 |
| ML | HuggingFace Transformers, PyTorch, scikit-learn, spaCy, NLTK |
| Database | PostgreSQL 16 |
| Message Broker | Redis 7 |
| Monitoring | Prometheus + Grafana |
| Infrastructure | Docker Compose |
| Auth | JWT (jjwt 0.12.6) |
| API Docs | Swagger (springdoc-openapi) |



---

**Detection Layers:**
| Layer | Method | Weight |
|-------|--------|--------|
| Layer 1 | RoBERTa fine-tuned classifier | 60% |
| Layer 2 | Stylistic features (LogReg) | 20% |
| Layer 3 | GPT-2 perplexity + entropy | 20% |


---

## Prerequisites

Before you start, make sure you have **all of these installed**:

| Tool | Version | Download |
|------|---------|----------|
| **Git** | Any | https://git-scm.com |
| **Docker Desktop** | Latest | https://www.docker.com/products/docker-desktop |
| **Docker Compose** | Included with Docker Desktop | — |

> ✅ That's it! Docker will handle Python, Java, Node.js, Redis, and PostgreSQL automatically.

**Check if Docker is running:**
```bash
docker --version
docker compose version
```

---

## Quick Start (Recommended)

> ⏱️ First launch takes **5–10 minutes** (downloading AI models ~3GB). Be patient!

```bash
# 1. Clone the repository
git clone https://github.com/CyPheer1/veriai-project.git

# 2. Go into the project folder
cd veriai-project

# 3. Copy the environment file
cp .env.example .env

# 4. Launch everything with Docker
docker compose up --build
```

**Wait until you see these messages in the logs:**
```
✅ "Models loaded at FastAPI startup"
✅ "Worker process initialized with loaded models"
✅ "Started Application in X seconds"
```

Then open your browser: **http://localhost:3000** 🎉

---

## Step-by-Step Setup

### Step 1 — Clone the project

```bash
git clone https://github.com/CyPheer1/veriai-project.git
cd veriai-project
```

### Step 2 — Set up the environment file

```bash
# On Linux / macOS
cp .env.example .env

# On Windows (CMD)
copy .env.example .env

# On Windows (PowerShell)
Copy-Item .env.example .env
```

> ⚠️ The `.env` file contains secrets. **Never commit it to GitHub.**

### Step 3 — Build and start all services

```bash
docker compose up --build
```

This command will:
- Build the Java Spring Boot backend
- Build the Python FastAPI AI service
- Build the React frontend
- Start PostgreSQL, Redis, Prometheus, Grafana
- Download AI models from HuggingFace (first time only)

### Step 4 — Wait for startup

Watch the logs for these confirmation messages:

```
ai-service      | Models loaded at FastAPI startup
detection-worker| Worker process initialized with loaded models
backend-java    | Started BackendJavaApplication in X.XXX seconds
frontend        | Local: http://localhost:3000/
```

### Step 5 — Open the app

Go to: **http://localhost:3000**

---

## Access the App

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 **Frontend** | http://localhost:3000 | Main web app |
| 🔧 **Backend API** | http://localhost:8080 | REST API |
| 📚 **Swagger Docs** | http://localhost:8080/swagger-ui.html | API documentation |
| 📊 **Grafana** | http://localhost:3001 | Monitoring dashboard |
| 🔍 **Prometheus** | http://localhost:9090 | Metrics |

---

## Useful Commands

### Start the project
```bash
docker compose up --build
```

### Start in background (detached mode)
```bash
docker compose up --build -d
```

### View logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f ai-service
docker compose logs -f backend-java
docker compose logs -f frontend
```

### Stop the project
```bash
# Stop but keep data
docker compose down

# Stop and delete all data (fresh start)
docker compose down -v
```

### Scale AI workers for more performance
```bash
docker compose up --scale detection-worker=3
```

### Rebuild a specific service
```bash
docker compose up --build ai-service
```

---

## Test the API (Optional)

```bash
# 1. Register an account
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234!","plan":"FREE"}'

# 2. Login and get JWT token
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234!"}'

# 3. Submit text for analysis (replace YOUR_TOKEN)
curl -X POST http://localhost:8080/api/v1/submissions/text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"text":"The quick brown fox jumps over the lazy dog..."}'

# 4. Get result (replace SUBMISSION_ID and YOUR_TOKEN)
curl http://localhost:8080/api/v1/submissions/SUBMISSION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React + Vite + TailwindCSS |
| Backend | Spring Boot 3.4 + Java 21 |
| AI Service | FastAPI + Python 3.11 + Celery |
| ML Models | HuggingFace Transformers + PyTorch + scikit-learn |
| Database | PostgreSQL 16 |
| Cache/Queue | Redis 7 |
| Monitoring | Prometheus + Grafana |
| Infrastructure | Docker Compose |

---

## Troubleshooting

### ❌ `docker: command not found`
→ Install Docker Desktop from https://www.docker.com/products/docker-desktop and make sure it's running.

### ❌ Port already in use (e.g., port 3000 or 8080)
→ Stop any other apps using those ports, or change the ports in `docker-compose.yml`.

### ❌ AI models not loading / timeout
→ First launch downloads ~3GB of AI models. Wait longer or check your internet connection.
```bash
docker compose logs -f ai-service
```

### ❌ `no space left on device`
→ Free up disk space. Docker images + AI models need ~5GB.
```bash
docker system prune  # Clean unused Docker data
```

### ❌ Database connection error on first start
→ PostgreSQL may still be initializing. Wait 30 seconds and retry, or restart:
```bash
docker compose restart backend-java
```

### 🔄 Fresh Reset (if something is broken)
```bash
docker compose down -v    # Remove all containers + data
docker compose up --build # Rebuild from scratch
```

---

## Project Structure

```
veriai-project/
├── frontend/          # React app (port 3000)
├── backend-java/      # Spring Boot API (port 8080)
├── SERVICE IA/        # FastAPI + Celery AI workers (port 8000)
├── infra/             # PostgreSQL schema, Prometheus, Grafana config
├── docker-compose.yml # Orchestrates all 9 services
├── .env.example       # Environment template (copy to .env)
└── README.md          # This file
```
---

<div align="center">

**Built with ❤️ — VeriAI Team**

</div>
