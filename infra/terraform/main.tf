provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_project_service" "services" {
  for_each = toset([
    "compute.googleapis.com",
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "redis.googleapis.com",
    "vpcaccess.googleapis.com",
    "iam.googleapis.com",
  ])
  service = each.key
}

resource "google_artifact_registry_repository" "veriai" {
  location      = var.region
  repository_id = "${var.service_name_prefix}-images"
  format        = "DOCKER"
  depends_on    = [google_project_service.services]
}

resource "google_service_account" "veriai" {
  account_id   = "${var.service_name_prefix}-sa"
  display_name = "VeriAI Cloud Run SA"
}

resource "google_project_iam_member" "secret_access" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.veriai.email}"
}

resource "google_secret_manager_secret" "database_url" {
  secret_id = "${var.service_name_prefix}-database-url"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "database_url" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = var.database_url
}

resource "google_secret_manager_secret" "spring_datasource_url" {
  secret_id = "${var.service_name_prefix}-spring-datasource-url"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "spring_datasource_url" {
  secret      = google_secret_manager_secret.spring_datasource_url.id
  secret_data = var.spring_datasource_url
}

resource "google_secret_manager_secret" "spring_datasource_username" {
  secret_id = "${var.service_name_prefix}-spring-datasource-username"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "spring_datasource_username" {
  secret      = google_secret_manager_secret.spring_datasource_username.id
  secret_data = var.spring_datasource_username
}

resource "google_secret_manager_secret" "spring_datasource_password" {
  secret_id = "${var.service_name_prefix}-spring-datasource-password"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "spring_datasource_password" {
  secret      = google_secret_manager_secret.spring_datasource_password.id
  secret_data = var.spring_datasource_password
}

resource "google_secret_manager_secret" "internal_service_token" {
  secret_id = "${var.service_name_prefix}-internal-token"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "internal_service_token" {
  secret      = google_secret_manager_secret.internal_service_token.id
  secret_data = var.internal_service_token
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "${var.service_name_prefix}-jwt-secret"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "jwt_secret" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = var.jwt_secret
}

resource "google_redis_instance" "redis" {
  name               = "${var.service_name_prefix}-redis"
  tier               = var.redis_tier
  memory_size_gb     = var.redis_memory_gb
  region             = var.region
  authorized_network = "projects/${var.project_id}/global/networks/default"
  depends_on         = [google_project_service.services]
}

resource "google_vpc_access_connector" "connector" {
  name          = "${var.service_name_prefix}-connector"
  region        = var.region
  network       = "default"
  ip_cidr_range = "10.8.0.0/28"
  depends_on    = [google_project_service.services]
}

locals {
  frontend_region      = var.frontend_region != "" ? var.frontend_region : var.region
  cors_allowed_origins = trimspace(var.backend_cors_allowed_origins) != "" ? var.backend_cors_allowed_origins : var.frontend_url
  redis_url            = "redis://${google_redis_instance.redis.host}:6379/0"
  redis_backend_url    = "redis://${google_redis_instance.redis.host}:6379/1"
}

resource "google_cloud_run_v2_service" "backend" {
  name     = "${var.service_name_prefix}-backend"
  location = var.region

  template {
    annotations = {
      "run.googleapis.com/cpu-throttling" = "false"
    }
    containers {
      image = var.backend_image
      ports {
        container_port = 8080
      }
      env {
        name  = "SPRING_PROFILES_ACTIVE"
        value = "docker"
      }
      env {
        name = "SPRING_DATASOURCE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.spring_datasource_url.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "SPRING_DATASOURCE_USERNAME"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.spring_datasource_username.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "SPRING_DATASOURCE_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.spring_datasource_password.secret_id
            version = "latest"
          }
        }
      }
      env {
        name  = "SPRING_JPA_HIBERNATE_DDL_AUTO"
        value = "validate"
      }
      env {
        name  = "SPRING_JPA_SHOW_SQL"
        value = "false"
      }
      env {
        name  = "MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE"
        value = "health,info,prometheus"
      }
      env {
        name = "JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jwt_secret.secret_id
            version = "latest"
          }
        }
      }
      env {
        name  = "JWT_EXPIRATION_SECONDS"
        value = "86400"
      }
      env {
        name  = "APP_CORS_ALLOWED_ORIGINS"
        value = local.cors_allowed_origins
      }
      env {
        name  = "FREE_PLAN_DAILY_CREDITS"
        value = "3000"
      }
      env {
        name  = "FREE_PLAN_TEXT_WORD_LIMIT"
        value = "1000"
      }
      env {
        name  = "PREMIUM_MONTHLY_PRICE_USD"
        value = "10"
      }
      env {
        name  = "AI_SERVICE_BASE_URL"
        value = google_cloud_run_v2_service.ai_service.uri
      }
      env {
        name  = "AI_SERVICE_ENQUEUE_PATH"
        value = "/internal/v1/analyze"
      }
      env {
        name = "INTERNAL_SERVICE_TOKEN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.internal_service_token.secret_id
            version = "latest"
          }
        }
      }
      startup_probe {
        initial_delay_seconds = 5
        timeout_seconds       = 5
        period_seconds        = 10
        failure_threshold     = 6
        http_get {
          path = "/actuator/health"
        }
      }
    }
    service_account = google_service_account.veriai.email
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
  depends_on = [google_project_service.services, google_cloud_run_v2_service.ai_service]
}

resource "google_cloud_run_v2_service" "ai_service" {
  name     = "${var.service_name_prefix}-ai-service"
  location = var.region

  template {
    annotations = {
      "run.googleapis.com/cpu-throttling" = "false"
    }
    containers {
      image = var.ai_service_image
      ports {
        container_port = 8080
      }
      startup_probe {
        initial_delay_seconds = 20
        timeout_seconds       = 5
        period_seconds        = 10
        failure_threshold     = 12
        http_get {
          path = "/health"
        }
      }
      env {
        name  = "APP_ENV"
        value = "production"
      }
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.secret_id
            version = "latest"
          }
        }
      }
      env {
        name  = "REDIS_URL"
        value = local.redis_url
      }
      env {
        name  = "CELERY_BROKER_URL"
        value = local.redis_url
      }
      env {
        name  = "CELERY_RESULT_BACKEND"
        value = local.redis_backend_url
      }
      env {
        name  = "HUGGINGFACE_MODEL_NAME"
        value = var.huggingface_model_name
      }
      env {
        name  = "GPT2_MODEL_NAME"
        value = var.gpt2_model_name
      }
      env {
        name  = "HF_HOME"
        value = var.hf_home
      }
      env {
        name  = "LOAD_MODELS_ON_STARTUP"
        value = var.load_models_on_startup ? "true" : "false"
      }
      env {
        name  = "CHUNK_MIN_WORDS"
        value = "120"
      }
      env {
        name  = "CHUNK_MAX_WORDS"
        value = "512"
      }
      env {
        name  = "CHUNK_MIN_PROCESS_WORDS"
        value = "50"
      }
      env {
        name  = "RELIABILITY_MIN_WORDS"
        value = "120"
      }
      env {
        name  = "FULL_MODE_LAYER1_WEIGHT"
        value = "0.6"
      }
      env {
        name  = "FULL_MODE_LAYER2_WEIGHT"
        value = "0.2"
      }
      env {
        name  = "FULL_MODE_LAYER3_WEIGHT"
        value = "0.2"
      }
      env {
        name  = "AI_LABEL_THRESHOLD"
        value = "0.5"
      }
      env {
        name  = "DEFAULT_CONFIDENCE"
        value = "0.5"
      }
      env {
        name  = "CELERY_TASK_MAX_RETRIES"
        value = "3"
      }
      env {
        name  = "CELERY_RETRY_BACKOFF_BASE"
        value = "2"
      }
      env {
        name  = "CELERY_WATCHDOG_SCHEDULE_SECONDS"
        value = "600"
      }
      env {
        name  = "CELERY_WATCHDOG_STUCK_MINUTES"
        value = "30"
      }
      env {
        name = "INTERNAL_SERVICE_TOKEN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.internal_service_token.secret_id
            version = "latest"
          }
        }
      }
      resources {
        limits = {
          cpu    = var.ai_service_cpu
          memory = var.ai_service_memory
        }
      }
    }
    service_account = google_service_account.veriai.email
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
  depends_on = [google_project_service.services]
}

resource "google_cloud_run_v2_service" "detection_worker" {
  name     = "${var.service_name_prefix}-detection-worker"
  location = var.region

  template {
    scaling {
      min_instance_count = 1
      max_instance_count = 1
    }
    annotations = {
      "run.googleapis.com/cpu-throttling" = "false"
    }
    containers {
      image   = var.detection_worker_image
      command = ["/app/scripts/run_celery_worker.sh"]
      ports {
        container_port = 8080
      }
      startup_probe {
        initial_delay_seconds = 5
        timeout_seconds       = 5
        period_seconds        = 10
        failure_threshold     = 6
        http_get {
          path = "/"
        }
      }
      env {
        name  = "APP_ENV"
        value = "production"
      }
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.secret_id
            version = "latest"
          }
        }
      }
      env {
        name  = "REDIS_URL"
        value = local.redis_url
      }
      env {
        name  = "CELERY_BROKER_URL"
        value = local.redis_url
      }
      env {
        name  = "CELERY_RESULT_BACKEND"
        value = local.redis_backend_url
      }
      env {
        name  = "HUGGINGFACE_MODEL_NAME"
        value = var.huggingface_model_name
      }
      env {
        name  = "GPT2_MODEL_NAME"
        value = var.gpt2_model_name
      }
      env {
        name  = "HF_HOME"
        value = var.hf_home
      }
      env {
        name  = "LOAD_MODELS_ON_STARTUP"
        value = var.load_models_on_startup ? "true" : "false"
      }
      env {
        name  = "CHUNK_MIN_WORDS"
        value = "120"
      }
      env {
        name  = "CHUNK_MAX_WORDS"
        value = "512"
      }
      env {
        name  = "CHUNK_MIN_PROCESS_WORDS"
        value = "50"
      }
      env {
        name  = "RELIABILITY_MIN_WORDS"
        value = "120"
      }
      env {
        name  = "FULL_MODE_LAYER1_WEIGHT"
        value = "0.6"
      }
      env {
        name  = "FULL_MODE_LAYER2_WEIGHT"
        value = "0.2"
      }
      env {
        name  = "FULL_MODE_LAYER3_WEIGHT"
        value = "0.2"
      }
      env {
        name  = "AI_LABEL_THRESHOLD"
        value = "0.5"
      }
      env {
        name  = "DEFAULT_CONFIDENCE"
        value = "0.5"
      }
      env {
        name  = "CELERY_TASK_MAX_RETRIES"
        value = "3"
      }
      env {
        name  = "CELERY_RETRY_BACKOFF_BASE"
        value = "2"
      }
      env {
        name  = "CELERY_WATCHDOG_SCHEDULE_SECONDS"
        value = "600"
      }
      env {
        name  = "CELERY_WATCHDOG_STUCK_MINUTES"
        value = "30"
      }
      env {
        name = "INTERNAL_SERVICE_TOKEN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.internal_service_token.secret_id
            version = "latest"
          }
        }
      }
      resources {
        limits = {
          cpu    = var.worker_cpu
          memory = var.worker_memory
        }
      }
    }
    service_account = google_service_account.veriai.email
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
  depends_on = [google_project_service.services]
}

resource "google_cloud_run_v2_service" "detection_beat" {
  name     = "${var.service_name_prefix}-detection-beat"
  location = var.region

  template {
    scaling {
      min_instance_count = 1
      max_instance_count = 1
    }
    annotations = {
      "run.googleapis.com/cpu-throttling" = "false"
    }
    containers {
      image   = var.detection_beat_image
      command = ["/app/scripts/run_celery_beat.sh"]
      ports {
        container_port = 8080
      }
      startup_probe {
        initial_delay_seconds = 5
        timeout_seconds       = 5
        period_seconds        = 10
        failure_threshold     = 6
        http_get {
          path = "/"
        }
      }
      env {
        name  = "APP_ENV"
        value = "production"
      }
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.secret_id
            version = "latest"
          }
        }
      }
      env {
        name  = "REDIS_URL"
        value = local.redis_url
      }
      env {
        name  = "CELERY_BROKER_URL"
        value = local.redis_url
      }
      env {
        name  = "CELERY_RESULT_BACKEND"
        value = local.redis_backend_url
      }
      env {
        name  = "HUGGINGFACE_MODEL_NAME"
        value = var.huggingface_model_name
      }
      env {
        name  = "GPT2_MODEL_NAME"
        value = var.gpt2_model_name
      }
      env {
        name  = "HF_HOME"
        value = var.hf_home
      }
      env {
        name  = "LOAD_MODELS_ON_STARTUP"
        value = var.load_models_on_startup ? "true" : "false"
      }
      env {
        name  = "CHUNK_MIN_WORDS"
        value = "120"
      }
      env {
        name  = "CHUNK_MAX_WORDS"
        value = "512"
      }
      env {
        name  = "CHUNK_MIN_PROCESS_WORDS"
        value = "50"
      }
      env {
        name  = "RELIABILITY_MIN_WORDS"
        value = "120"
      }
      env {
        name  = "FULL_MODE_LAYER1_WEIGHT"
        value = "0.6"
      }
      env {
        name  = "FULL_MODE_LAYER2_WEIGHT"
        value = "0.2"
      }
      env {
        name  = "FULL_MODE_LAYER3_WEIGHT"
        value = "0.2"
      }
      env {
        name  = "AI_LABEL_THRESHOLD"
        value = "0.5"
      }
      env {
        name  = "DEFAULT_CONFIDENCE"
        value = "0.5"
      }
      env {
        name  = "CELERY_TASK_MAX_RETRIES"
        value = "3"
      }
      env {
        name  = "CELERY_RETRY_BACKOFF_BASE"
        value = "2"
      }
      env {
        name  = "CELERY_WATCHDOG_SCHEDULE_SECONDS"
        value = "600"
      }
      env {
        name  = "CELERY_WATCHDOG_STUCK_MINUTES"
        value = "30"
      }
      env {
        name = "INTERNAL_SERVICE_TOKEN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.internal_service_token.secret_id
            version = "latest"
          }
        }
      }
      resources {
        limits = {
          cpu    = var.beat_cpu
          memory = var.beat_memory
        }
      }
    }
    service_account = google_service_account.veriai.email
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
  depends_on = [google_project_service.services]
}

resource "google_cloud_run_v2_service" "frontend" {
  name     = "${var.service_name_prefix}-frontend"
  location = local.frontend_region

  template {
    annotations = {
      "run.googleapis.com/cpu-throttling" = "false"
    }
    containers {
      image = var.frontend_image
      ports {
        container_port = 8080
      }
      startup_probe {
        initial_delay_seconds = 5
        timeout_seconds       = 5
        period_seconds        = 10
        failure_threshold     = 6
        http_get {
          path = "/"
        }
      }
    }
    service_account = google_service_account.veriai.email
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
  depends_on = [google_project_service.services]
}

resource "google_cloud_run_v2_service_iam_member" "frontend_public" {
  name     = google_cloud_run_v2_service.frontend.name
  location = local.frontend_region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service_iam_member" "backend_public" {
  name     = google_cloud_run_v2_service.backend.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service_iam_member" "ai_public" {
  name     = google_cloud_run_v2_service.ai_service.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}
