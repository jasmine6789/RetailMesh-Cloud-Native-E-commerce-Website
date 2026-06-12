# Local Kubernetes (Minikube + Helm)

Optional path that runs the same Docker images as [LOCAL-DOCKER.md](../LOCAL-DOCKER.md), but as pods in Minikube. The primary automation script is `scripts/deploy/deploy.sh` (Helm charts under `Deployments/helm/`).

The React micro-frontends still run on the host (not in the cluster).

## 1. Prerequisites checklist

Install and verify before deploying:

| Tool | Purpose | Verify |
|------|---------|--------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Minikube driver + image builds | `docker version` |
| [Minikube](https://minikube.sigs.k8s.io/docs/start/) | Local cluster | `minikube version` |
| [kubectl](https://kubernetes.io/docs/tasks/tools/) | Cluster CLI | `kubectl version --client` |
| [Helm 3](https://helm.sh/docs/intro/install/) | Chart installs | `helm version` |
| [AWS CLI v2](https://aws.amazon.com/cli/) | LocalStack S3 upload/verify | `aws --version` |
| Bash | Deploy + image scripts | Git Bash or WSL on Windows |
| `curl` | Smoke checks | `curl --version` |
| Node.js 18+ | Micro-frontends | `node --version` |

**Host resources (recommended):**

- RAM: **12 GB+** free for Minikube (`deploy.sh` starts with `--memory=10240`)
- CPUs: **6–8**
- Disk: **80 GB+** for images and cluster data

**Product images:** the repo ships only `assets/product-images/.gitkeep`. Download images once:

```powershell
.\scripts\download-product-images.ps1
```

**JWT:** Helm APIs share settings in `Deployments/helm/jwt-values.yaml` (aligned with `.env.example`).

## 2. Deploy the cluster

From the **repository root** (Git Bash or WSL on Windows):

```bash
bash scripts/deploy/deploy.sh
```

On first run, choose **install** when prompted. The script:

1. Starts Minikube (if not running) and builds images into the Minikube Docker daemon
2. Deploys databases, RabbitMQ, Elasticsearch, LocalStack, monitoring
3. Uploads product images to LocalStack (`init-localstack-s3.sh`)
4. Mounts `assets/product-images` into Minikube for Catalog migration
5. Deploys **Identity.API**, Catalog, Basket, Ordering, Discount, Ocelot gateway
6. Runs Catalog image migration (`migrate-images-to-localstack.sh`)
7. Sets up port-forwards (gateway `8010`, LocalStack `4566`, monitoring, etc.)
8. Optionally starts micro-frontends (`npm start` in background)

Expect **15–30+ minutes** on first run (image builds + SQL Server / Elasticsearch cold start).

## 3. Start the storefront (if not already running)

```bash
cd micro-frontends
npm run setup
npm start
```

Open [http://localhost:4200](http://localhost:4200). API traffic goes to the gateway at `http://localhost:8010`.

## 4. Verify commands (smoke test checklist)

Run these after `deploy.sh` finishes. Port-forwards must be active (the deploy script starts them; restart with `scripts/access/access-services.sh` if needed).

### Cluster health

```bash
minikube status
kubectl get pods -n default
kubectl get pods -n monitoring
```

All `eshopping-*` pods in `default` should be `Running` (or `Completed` for jobs). Catalog / Identity cold start can take a few minutes.

### API gateway

```bash
curl -s http://localhost:8010/health
curl -s http://localhost:8010/ | head -c 200
curl -s http://localhost:8010/Catalog/GetAllProducts | head -c 300
```

### Identity (JWT)

```bash
curl -s -X POST http://localhost:8010/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@retailmesh.com","password":"Demo@12345"}'
```

Expect JSON with `accessToken`.

| Account | Password |
|---------|----------|
| `demo@retailmesh.com` | `Demo@12345` |
| `admin@retailmesh.com` | `Admin@12345` |

### LocalStack (product images)

```bash
curl -s http://localhost:4566/_localstack/health
bash scripts/verify-localstack.sh http://localhost:4566 ecommerce-product-images
```

Product `ImageFile` URLs use `http://127.0.0.1:4566/ecommerce-product-images/products/...` — the browser needs LocalStack on port **4566** forwarded.

Sample image URL (replace filename):

```text
http://127.0.0.1:4566/ecommerce-product-images/products/acer_helios_300_1.png
```

### Re-run image migration (manual)

If images are missing after deploy:

```bash
kubectl port-forward svc/eshopping-catalog 8000:80 -n default &
kubectl port-forward svc/eshopping-localstack 4566:4566 -n default &
bash scripts/migrate-images-to-localstack.sh http://localhost:8000 http://localhost:4566
```

### Monitoring (optional)

| Service | URL |
|---------|-----|
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 |
| Jaeger | http://localhost:16686 |
| Kibana | http://localhost:5601 |
| RabbitMQ UI | http://localhost:15672 (`guest` / `guest`) |

## 5. Local URLs (after port-forwards)

| Service | URL |
|---------|-----|
| Storefront (host) | http://localhost:4200 |
| API gateway | http://localhost:8010 |
| LocalStack S3 | http://localhost:4566 |

Direct pod access is via `kubectl port-forward`; there is no host port for Catalog/Identity like Docker Compose.

## 6. Access portal & cleanup

```bash
# Interactive port-forward menu
bash scripts/access/access-services.sh

# Remove Helm releases and cluster resources
bash scripts/cleanup/cleanup.sh

# Stop Minikube entirely
minikube stop
minikube delete   # full reset
```

## 7. Troubleshooting

| Symptom | Things to try |
|---------|----------------|
| `deploy.sh` fails on prerequisites | Install missing tools from the table in §1 |
| Pods stuck `Pending` / webhook errors | `minikube delete && minikube start`; script removes stale Istio webhooks when istiod is absent |
| Catalog not ready for migration | Wait 2–3 min; retry `migrate-images-to-localstack.sh` |
| No product images in UI | Run `download-product-images.ps1`; verify LocalStack on `4566`; run `verify-localstack.sh` |
| `minikube mount` fails (Windows) | Restart Minikube; re-run deploy; or upload only via `init-localstack-s3.sh` (seed URLs may still work) |
| Gateway / LocalStack connection refused | `pkill -f kubectl.port-forward` then `bash scripts/access/access-services.sh` |
| Login fails | Confirm Identity pod running: `kubectl get pods -l app.kubernetes.io/instance=eshopping-identity` |

## 8. Related docs

- [LOCAL-DOCKER.md](../LOCAL-DOCKER.md) — primary Docker Compose workflow
- [scripts/README.md](../scripts/README.md) — script index
- [Deployments/helm/jwt-values.yaml](../Deployments/helm/jwt-values.yaml) — shared JWT for Helm APIs
- [README.md](../README.md) — architecture overview
