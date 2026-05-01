#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "$SCRIPT_DIR"

PROJECT_ID=${PROJECT_ID:-standard-lab-493119}
REGION=${REGION:-europe-west3}
FRONTEND_REGION=${FRONTEND_REGION:-europe-west1}

terraform init

import_if_missing() {
  local addr="$1"
  local id="$2"

  if terraform state list | grep -Fx -- "$addr" >/dev/null 2>&1; then
    echo "SKIP   $addr"
  else
    echo "IMPORT $addr"
    terraform import "$addr" "$id"
  fi
}

import_if_missing 'google_artifact_registry_repository.veriai' \
  "projects/${PROJECT_ID}/locations/${REGION}/repositories/veriai-images"
import_if_missing 'google_service_account.veriai' \
  "projects/${PROJECT_ID}/serviceAccounts/veriai-sa@${PROJECT_ID}.iam.gserviceaccount.com"

import_if_missing 'google_secret_manager_secret.database_url' \
  "projects/${PROJECT_ID}/secrets/veriai-database-url"
import_if_missing 'google_secret_manager_secret.spring_datasource_url' \
  "projects/${PROJECT_ID}/secrets/veriai-spring-datasource-url"
import_if_missing 'google_secret_manager_secret.spring_datasource_username' \
  "projects/${PROJECT_ID}/secrets/veriai-spring-datasource-username"
import_if_missing 'google_secret_manager_secret.spring_datasource_password' \
  "projects/${PROJECT_ID}/secrets/veriai-spring-datasource-password"
import_if_missing 'google_secret_manager_secret.internal_service_token' \
  "projects/${PROJECT_ID}/secrets/veriai-internal-token"
import_if_missing 'google_secret_manager_secret.jwt_secret' \
  "projects/${PROJECT_ID}/secrets/veriai-jwt-secret"

import_if_missing 'google_redis_instance.redis' \
  "projects/${PROJECT_ID}/locations/${REGION}/instances/veriai-redis"
import_if_missing 'google_vpc_access_connector.connector' \
  "projects/${PROJECT_ID}/locations/${REGION}/connectors/veriai-connector"

import_if_missing 'google_cloud_run_v2_service.backend' \
  "projects/${PROJECT_ID}/locations/${REGION}/services/veriai-backend"
import_if_missing 'google_cloud_run_v2_service.ai_service' \
  "projects/${PROJECT_ID}/locations/${REGION}/services/veriai-ai-service"
import_if_missing 'google_cloud_run_v2_service.detection_worker' \
  "projects/${PROJECT_ID}/locations/${REGION}/services/veriai-detection-worker"
import_if_missing 'google_cloud_run_v2_service.detection_beat' \
  "projects/${PROJECT_ID}/locations/${REGION}/services/veriai-detection-beat"
import_if_missing 'google_cloud_run_v2_service.frontend' \
  "projects/${PROJECT_ID}/locations/${FRONTEND_REGION}/services/veriai-frontend"

echo
echo "Current state:"
terraform state list

echo
echo "Terraform plan:"
terraform plan
