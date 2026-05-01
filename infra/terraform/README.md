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

## Quick start

1) Copy `infra/terraform/terraform.tfvars.example` to `terraform.tfvars`
2) Fill in variables and run:

```bash
cd infra/terraform
terraform init
terraform apply
```

3) Build + push images (see `infra/terraform/deploy.sh`). Make sure `BACKEND_URL` matches the backend Cloud Run URL.

```bash
export PROJECT_ID=your-gcp-project-id
export REGION=europe-west3
export BACKEND_URL=https://your-backend-url
./deploy.sh
```

## Notes

- Cloud Run uses 8Gi/2CPU for AI services by default.
- The AI service and workers are deployed in the same VPC connector so they can reach Redis.
- If you want Cloud SQL later, swap `DATABASE_URL` to a Cloud SQL connector URL and add a private IP.
