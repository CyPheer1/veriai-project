variable "project_id" {
  type        = string
  description = "GCP project id"
}

variable "region" {
  type        = string
  description = "GCP region"
  default     = "europe-west3"
}

variable "service_name_prefix" {
  type        = string
  description = "Prefix for service names"
  default     = "veriai"
}

variable "frontend_image" {
  type        = string
  description = "Container image for frontend"
}

variable "backend_image" {
  type        = string
  description = "Container image for backend"
}

variable "ai_service_image" {
  type        = string
  description = "Container image for ai-service"
}

variable "detection_worker_image" {
  type        = string
  description = "Container image for detection worker"
}

variable "detection_beat_image" {
  type        = string
  description = "Container image for detection beat"
}

variable "frontend_url" {
  type        = string
  description = "Public frontend URL for CORS"
}

variable "database_url" {
  type        = string
  description = "Postgres connection string"
  sensitive   = true
}

variable "spring_datasource_url" {
  type        = string
  description = "JDBC datasource URL for Spring"
  sensitive   = true
}

variable "spring_datasource_username" {
  type        = string
  description = "Datasource username for Spring"
  sensitive   = true
}

variable "spring_datasource_password" {
  type        = string
  description = "Datasource password for Spring"
  sensitive   = true
}

variable "redis_tier" {
  type        = string
  description = "Redis tier"
  default     = "BASIC"
}

variable "redis_memory_gb" {
  type        = number
  description = "Redis memory size in GB"
  default     = 1
}

variable "internal_service_token" {
  type        = string
  description = "Token for internal service auth"
  sensitive   = true
}

variable "jwt_secret" {
  type        = string
  description = "JWT secret for backend"
  sensitive   = true
}

variable "grafana_admin_password" {
  type        = string
  description = "Grafana admin password"
  sensitive   = true
}

variable "load_models_on_startup" {
  type        = bool
  description = "Load ML models at FastAPI startup"
  default     = true
}

variable "huggingface_model_name" {
  type        = string
  description = "HuggingFace model name"
  default     = "mehddii/roberta-aigt-finetuning-v4"
}

variable "gpt2_model_name" {
  type        = string
  description = "GPT2 model name"
  default     = "gpt2-medium"
}

variable "hf_home" {
  type        = string
  description = "HuggingFace cache directory"
  default     = "/models-cache"
}

variable "ai_service_memory" {
  type        = string
  description = "Memory for ai-service"
  default     = "8Gi"
}

variable "ai_service_cpu" {
  type        = string
  description = "CPU for ai-service"
  default     = "2"
}

variable "worker_memory" {
  type        = string
  description = "Memory for worker"
  default     = "8Gi"
}

variable "worker_cpu" {
  type        = string
  description = "CPU for worker"
  default     = "2"
}

variable "beat_memory" {
  type        = string
  description = "Memory for beat"
  default     = "1Gi"
}

variable "beat_cpu" {
  type        = string
  description = "CPU for beat"
  default     = "1"
}
