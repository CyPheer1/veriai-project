output "backend_url" {
  value = google_cloud_run_v2_service.backend.uri
}

output "frontend_url" {
  value = google_cloud_run_v2_service.frontend.uri
}

output "ai_service_url" {
  value = google_cloud_run_v2_service.ai_service.uri
}

output "redis_host" {
  value = google_redis_instance.redis.host
}
