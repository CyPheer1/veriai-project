# GCP Terraform

This module provisions a minimal GCP stack for VeriAI:

- Cloud Run services for:
  - `backend-java`
  - `ai-service` (FastAPI)
  - `detection-worker` (Celery worker)
  - `detection-beat` (Celery beat)
  - `frontend` (static Nginx)
- Cloud Memorystore (Redis)
- Artifact Registry (Docker images)
- Service Account + IAM
- Secret Manager (sensitive env vars)
- Optional: Neon/Supabase (external Postgres) via connection string

Database is **not** created in GCP by default. Provide Neon/Supabase connection strings.

You must provide both:
- `database_url` (SQLAlchemy URL for Python)
- `spring_datasource_url` + `spring_datasource_username/password` (JDBC for Spring)
- `frontend_url` for backend CORS, or `backend_cors_allowed_origins` if you need multiple origins during a domain cutover

## Quick start

1) Copy `infra/terraform/terraform.tfvars.example` to `terraform.tfvars`
2) Fill in variables and run:

```bash
cd infra/terraform
terraform init
terraform apply
```

If you already created the GCP resources manually or from another machine and the local Terraform state is missing, import the existing resources before applying. At minimum, import the Artifact Registry repo, service account, Secret Manager secrets, Redis instance, VPC connector, and Cloud Run services instead of trying to recreate them.

3) Build + push images (see `infra/terraform/deploy.sh`). Use a placeholder URL for the first build.

```bash
export PROJECT_ID=your-gcp-project-id
export REGION=europe-west3
export BACKEND_URL=https://placeholder.example
./deploy.sh
```

4) Apply again to deploy Cloud Run services with the images:

```bash
terraform apply
```

5) Get the backend URL and rebuild the frontend with the real API base:

```bash
terraform output backend_url
export BACKEND_URL=https://your-backend-url
./deploy.sh
terraform apply
```

6) If the frontend still serves the placeholder backend URL, build and push a uniquely tagged frontend image and point `frontend_image` to that exact tag before the next `terraform apply`. Do not rely on reusing `frontend:latest` for this final cutover.

## Notes

- Cloud Run uses 8Gi/2CPU for AI services by default.
- The AI service and workers are deployed in the same VPC connector so they can reach Redis.
- Artifact Registry image paths must use `${service_name_prefix}-images` as the repo name, for example `europe-west3-docker.pkg.dev/<project-id>/veriai-images/frontend:latest`.
- VPC connector egress is set to `PRIVATE_RANGES_ONLY` so Cloud Run can still reach the internet for model downloads.
- If backend preflight requests return `403`, make sure `frontend_url` matches the real browser origin exactly, for example `https://veri4i.tech`. During migration you can set `backend_cors_allowed_origins = "https://veri4i.tech,https://<frontend-service>.run.app"`.
- If you need a custom frontend domain, deploy the frontend service in a supported region such as `europe-west1` via `frontend_region`, then attach the domain to that frontend Cloud Run service.
- The public IAM binding for the frontend Cloud Run service must use `frontend_region`, not the main `region`, otherwise Terraform will target the wrong regional service during custom-domain deployments.
- If you want Cloud SQL later, swap `DATABASE_URL` to a Cloud SQL connector URL and add a private IP.
