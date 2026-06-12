# Scripts

Utility scripts organized by purpose. Run from the **project root directory**.

## Directory Structure

| Directory | Purpose | Key Scripts |
|-----------|---------|-------------|
| `deploy/` | Deployment automation | `docker-deploy.sh` (Docker Compose), `deploy.sh` (optional Minikube/K8s) |
| `cleanup/` | Resource teardown | `cleanup.sh` (K8s) |
| `access/` | Service access portals | `access-services.sh` (K8s port-forwards) |

LocalStack / product images:

- `init-localstack-s3.sh` — create bucket and upload `assets/product-images/`
- `migrate-images-to-localstack.sh` — call Catalog `POST /api/v1/Admin/MigrateImagesToS3`
- `verify-localstack.sh`
- `download-product-images.ps1`
- `seed-localstack-product-images.ps1`

On **Docker Compose**, run `init-localstack-s3.sh` and `migrate-images-to-localstack.sh` manually after `docker compose up` (see [LOCAL-DOCKER.md](../LOCAL-DOCKER.md)).

On **Kubernetes**, `scripts/deploy/deploy.sh` runs both automatically: bucket upload during `deploy_localstack`, then Catalog migration after APIs are up. Product images are mounted into the Catalog pod via `minikube mount`; LocalStack stays on `localhost:4566` via port-forward. See [kubernetes/LOCAL-K8S.md](../kubernetes/LOCAL-K8S.md) for prerequisites and verify commands.

## Quick Reference

```bash
# Primary: Docker Compose (see LOCAL-DOCKER.md)
docker compose up -d --build

# Or use the helper script
./scripts/deploy/docker-deploy.sh

# Optional: Kubernetes (Minikube + Helm; includes Identity.API + shared JWT)
./scripts/deploy/deploy.sh
# JWT settings for Helm APIs: Deployments/helm/jwt-values.yaml

# Build Docker images only
./scripts/deploy/build-images.sh

# K8s access portal (after deploy.sh)
./scripts/access/access-services.sh

# K8s cleanup
./scripts/cleanup/cleanup.sh
```
