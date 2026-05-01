#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
PROJECT_ID=${PROJECT_ID:?"PROJECT_ID is required"}
REGION=${REGION:-"europe-west3"}
REPO="${REGION}-docker.pkg.dev/${PROJECT_ID}/veriai-images"
BACKEND_URL=${BACKEND_URL:?"BACKEND_URL is required"}

echo "Using Artifact Registry repo: ${REPO}"

gcloud auth configure-docker "${REGION}-docker.pkg.dev"

echo "Building backend-java image"
docker build -t "${REPO}/backend-java:latest" "${ROOT_DIR}/backend-java"

echo "Building ai-service image"
docker build -t "${REPO}/ai-service:latest" "${ROOT_DIR}/SERVICE IA"

echo "Building detection-worker image"
docker build -t "${REPO}/detection-worker:latest" "${ROOT_DIR}/SERVICE IA"

echo "Building detection-beat image"
docker build -t "${REPO}/detection-beat:latest" "${ROOT_DIR}/SERVICE IA"

echo "Building frontend image"
docker build --build-arg VITE_API_BASE_URL="$BACKEND_URL" -t "${REPO}/frontend:latest" "${ROOT_DIR}/frontend"

echo "Pushing images"
docker push "${REPO}/backend-java:latest"
docker push "${REPO}/ai-service:latest"
docker push "${REPO}/detection-worker:latest"
docker push "${REPO}/detection-beat:latest"
docker push "${REPO}/frontend:latest"

echo "Done. Update terraform.tfvars images to:"
echo "  ${REPO}/backend-java:latest"
echo "  ${REPO}/ai-service:latest"
echo "  ${REPO}/detection-worker:latest"
echo "  ${REPO}/detection-beat:latest"
echo "  ${REPO}/frontend:latest"
