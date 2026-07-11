# Local Docker Full-Stack (Fresh Clone)

This guide runs the backend microservices + infrastructure stack with Docker/Docker Compose, and then starts the React microfrontends (Nx) directly on the host.

Primary assumption: you are using `docker-compose.yml` + `docker-compose.override.yml` (both are required).

## 1. Prerequisites

- Docker Desktop (Linux containers)
- `docker compose` available in your terminal
- `curl` available for quick HTTP checks
- For LocalStack S3 image upload scripts: you need Bash (Git Bash or WSL)

## 2. Fresh clone + backend stack

### Windows PowerShell

```powershell
git clone https://github.com/jasmine6789/RetailMesh-Cloud-Native-E-commerce-Website.git
cd RetailMesh-Cloud-Native-E-commerce-Website

Copy-Item .env.example .env

docker compose up -d --build

# Seed category-matched product images into LocalStack (monitors/mice/laptops — not random stock photos)
.\scripts\seed-localstack-product-images.ps1 -Force
# Use -Force again after docker compose down -v / LocalStack reset if images look wrong

# Basic smoke checks
curl -s http://localhost:8010/ >/dev/null
curl -s http://localhost:8010/health >/dev/null
curl -s http://localhost:8000/health >/dev/null
curl -s http://localhost:8001/health >/dev/null
curl -s http://localhost:8003/health >/dev/null
curl -s http://localhost:8004/health >/dev/null

curl -s http://localhost:8010/Catalog/GetAllProducts | Out-Null
```

### Linux/macOS (bash)

```bash
git clone https://github.com/jasmine6789/RetailMesh-Cloud-Native-E-commerce-Website.git
cd RetailMesh-Cloud-Native-E-commerce-Website

cp .env.example .env
docker compose up -d --build

# Seed product images into LocalStack S3 (category-matched; never random picsum)
pwsh ./scripts/seed-localstack-product-images.ps1 -Force

curl -s http://localhost:8010/health >/dev/null
curl -s http://localhost:8010/Catalog/GetAllProducts >/dev/null
curl -s http://localhost:8004/health >/dev/null
```

## 2b. JWT login

After the stack is up, obtain a token via the API gateway:

```bash
curl -s -X POST http://127.0.0.1:8010/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@retailmesh.com","password":"Demo@12345"}'
```

Seeded accounts (created on `identity.api` startup):

| Email | Password |
|-------|----------|
| `demo@retailmesh.com` | `Demo@12345` |
| `admin@retailmesh.com` | `Admin@12345` |

Catalog **GET** endpoints work without a token. Basket and Ordering require `Authorization: Bearer <accessToken>` where the token email claim matches the `userName` in the request.

## 3. Observability endpoints

Open these in your browser:

- Website (microfrontend shell): `http://localhost:4200` (started in the next section)
- API Gateway (Ocelot): `http://localhost:8010`
- Prometheus: `http://localhost:9090`
- Prometheus targets page: `http://localhost:9090/targets`
- Grafana: `http://localhost:3000` (login: `admin` / `admin1234`)
- Jaeger UI: `http://localhost:16686`
- Kibana: `http://localhost:5601`

Provisioned Grafana dashboards (after the stack is up) show live ASP.NET metrics for Catalog, Basket, Ordering, and the gateway:

![Grafana — service request metrics](docs/images/grafana-service-request-metrics.png)

![Grafana — API activity by service](docs/images/grafana-api-activity.png)

Quick metric checks (run on the host):

```bash
curl -s http://localhost:8000/metrics | head -n 5
curl -s http://localhost:8001/metrics | head -n 5
curl -s http://localhost:8003/metrics | head -n 5
curl -s http://localhost:8010/metrics | head -n 5
```

Prometheus expected UP targets after metrics are enabled:

- `catalog-api` -> `catalog.api:80`
- `basket-api` -> `basket.api:80`
- `ordering-api` -> `ordering.api:80`
- `ocelot-api-gateway` -> `ocelot.apigateway:80`

## 4. LocalStack S3 (product images)

The platform uses LocalStack as an S3 emulator for product images.

From repo root, run (Git Bash or WSL):

```bash
bash scripts/init-localstack-s3.sh ecommerce-product-images http://localhost:4566 assets/product-images
bash scripts/migrate-images-to-localstack.sh http://localhost:8000 http://localhost:4566
```

## 5. Start the frontend (microfrontends)

The frontend is not containerized in this Docker workflow. Start it on the host:

```bash
cd micro-frontends
npm run setup
npm start
```

Then open:

- `http://localhost:4200`

API base URL is expected to be the gateway:

- `NX_API_BASE_URL=http://127.0.0.1:8010`

Sign in at `http://localhost:4200/login` with `demo@retailmesh.com` / `Demo@12345`, or create a new account at `http://localhost:4200/register`. Set `NX_USE_MOCK_DATA=true` to auto-login with the seeded demo user (requires Identity.API running).

## 6. Stop / clean up

```bash
docker compose down
docker compose down -v
```

Use `down -v` to wipe databases/volumes.

## 7. Troubleshooting

### Ocelot returns 502 / gateway routing failures

- Confirm the gateway is running with `ASPNETCORE_ENVIRONMENT=Docker` (it should load `ApiGateways/Ocelot.ApiGateway/ocelot.Docker.json`).
- Verify direct API health endpoints:
  - `http://localhost:8000/health`
  - `http://localhost:8001/health`
  - `http://localhost:8003/health`

### MongoDB authentication errors (Catalog service)

- Ensure `.env` contains:
  - `MONGODB_URL=mongodb://admin:admin1234@catalogdb:27017/CatalogDb?authSource=admin`

### Prometheus targets remain DOWN

- Verify metrics endpoints:
  - `http://localhost:8000/metrics`
  - `http://localhost:8001/metrics`
  - `http://localhost:8003/metrics`
  - `http://localhost:8010/metrics`
- If metrics endpoints 404, rebuild:
  - `docker compose up -d --build`

### Elasticsearch crashes / OOM

- Update `ES_JAVA_OPTS` in `.env` to a smaller heap (example: `-Xms256m -Xmx256m`), then rebuild.

