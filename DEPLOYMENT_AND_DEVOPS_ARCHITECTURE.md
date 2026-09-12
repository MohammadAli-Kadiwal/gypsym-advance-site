# Gypsym Technology: Cloud Infrastructure, DevOps & Production Deployment Architecture

**Author**: Principal Cloud & DevOps Architect  
**Scope**: Full Stack Ecosystem (`apps/web`, `apps/admin`, `apps/api`, `packages/database`, `packages/shared-types`)  
**Target Environments**: Development, Staging, Production  
**Cloud Providers**: AWS (Primary) / Multi-Cloud Hyperscaler Ready  
**Date**: September 2026  

---

## 1. Production Topology & High-Level Architecture

```mermaid
flowchart TD
    subgraph Edge ["Global Edge & Ingress Layer"]
        DNS["Cloudflare / Route 53 (DNS Anycast + DDoS Shield)"]
        CDN["Cloudflare Edge CDN (Static Assets & ISR HTML)"]
        WAF["AWS WAF / Cloudflare WAF (OWASP Rules + Rate Limiting)"]
        ALB["AWS Application Load Balancer (TLS 1.3 Termination)"]
    end

    subgraph VPC ["AWS Virtual Private Cloud (10.0.0.0/16)"]
        subgraph PublicSubnets ["Public Subnets (NAT Gateway + Ingress)"]
            NAT["NAT Gateways (Multi-AZ)"]
        end

        subgraph PrivateAppSubnets ["Private Application Subnets (EKS / ECS Fargate)"]
            WebPods["apps/web (Next.js SSR Pods)"]
            AdminPods["apps/admin (Next.js Admin Workstation)"]
            ApiPods["apps/api (NestJS REST API Engine)"]
        end

        subgraph PrivateDataSubnets ["Private Data Subnets (Isolated - No Internet Ingress)"]
            PgBouncer["PgBouncer Connection Pooler (Multi-AZ)"]
            AuroraMaster["Amazon Aurora PostgreSQL 16 (Writer Node)"]
            AuroraReplica["Amazon Aurora PostgreSQL 16 (Read Replica Node)"]
            RedisCluster["Amazon ElastiCache Redis 7 (Auth Sessions & Caching)"]
        end

        subgraph StorageLayer ["Managed Cloud Services"]
            S3Private["Amazon S3 Private (Resumes & Internal Docs)"]
            S3Public["Amazon S3 Public + CloudFront (Optimized Media Assets)"]
            SES["Amazon SES (Transactional Email + DKIM/SPF)"]
            KMS["AWS KMS (Envelope Encryption Keys)"]
            SecretsManager["AWS Secrets Manager (Dynamic Secret Injection)"]
        end
    end

    DNS --> CDN
    CDN --> WAF
    WAF --> ALB
    ALB --> WebPods
    ALB --> AdminPods
    ALB --> ApiPods
    WebPods --> ApiPods
    AdminPods --> ApiPods
    ApiPods --> PgBouncer
    ApiPods --> RedisCluster
    PgBouncer --> AuroraMaster
    PgBouncer --> AuroraReplica
    ApiPods --> S3Private
    ApiPods --> S3Public
    ApiPods --> SES
```

---

## 2. Multi-Environment Topology Specification

| Attribute | Development (`dev`) | Staging (`staging`) | Production (`prod`) |
| :--- | :--- | :--- | :--- |
| **Domain** | `dev.gypsym.com` | `staging.gypsym.com` | `gypsym.com` / `admin.gypsym.com` |
| **Compute** | Docker Compose / Local K8s | EKS Cluster (2 nodes, `t4g.medium`) | EKS Cluster (Multi-AZ, `c7g.xlarge` ARM64 Graviton3) |
| **Database** | PostgreSQL 16 (Docker container) | AWS RDS PostgreSQL 16 (`db.t4g.medium`) | Amazon Aurora PostgreSQL 16 Multi-AZ (Serverless v2 / `db.r7g.xlarge`) |
| **Connection Pooling**| Direct connection | PgBouncer (1 instance, 50 pool) | PgBouncer Multi-AZ (Transaction Pooling, 500 pool) |
| **Caching / Sessions**| Redis 7 (Docker container) | ElastiCache Redis (`cache.t4g.small`) | ElastiCache Redis Cluster (Multi-AZ, automatic failover) |
| **Object Storage** | MinIO (Local S3-compatible) | S3 Bucket (`gypsym-staging-assets`) | S3 Buckets (`gypsym-prod-media-public`, `gypsym-prod-private`) |
| **Email Delivery** | Mailpit / Local Mock SMTP | Amazon SES Sandbox | Amazon SES Production (Dedicated IP, DKIM, DMARC `p=reject`) |
| **Replication / HA** | Single Node | Single AZ with automated snapshots | Multi-AZ with Read Replicas & Cross-Region Disaster Recovery |
| **Deployment Mode** | Direct container restart | Automated Rolling Update | Blue/Green Zero-Downtime with Automated Canary Verification |

---

## 3. Environment Variables & Secret Management Architecture

### 3.1 Zero-Secret Repository Rule
- **Mandate**: No production, staging, or development credentials, private keys, or API tokens shall ever be committed to git repositories or baked into Docker container images.
- **Enforcement**:
  1. Pre-commit hooks (`gitleaks`, `trufflehog`) scanning all staged commits.
  2. CI build gate scanning repo histories with `GitGuardian`.
  3. Runtime injection exclusively via **AWS Secrets Manager** or **HashiCorp Vault** using Kubernetes External Secrets Operator (`ESO`) or AWS ECS Task Execution Roles.

### 3.2 Environment Variable Matrix

```
+----------------------------------------------------------------------------------------------------+
|                                    ENVIRONMENT VARIABLE MATRIX                                     |
+----------------------------------------------------------------------------------------------------+
| Variable Name              Type        Default / Dev Example           Prod Source                 |
| -------------------------- ----------- ------------------------------- --------------------------- |
| NODE_ENV                   Config      development                     Injected by Container       |
| PORT                       Config      4000 (API), 3000 (Web), 3001    Injected by Container       |
| API_PREFIX                 Config      /api/v1                         Injected by Container       |
| DATABASE_URL               Secret      postgresql://app:pass@db:5432/..AWS Secrets Manager (IAM)   |
| DIRECT_URL                 Secret      postgresql://app:pass@db:5432/..AWS Secrets Manager (Migr)  |
| JWT_ACCESS_SECRET          Secret      (32+ random chars)              AWS Secrets Manager (KMS)   |
| JWT_REFRESH_SECRET         Secret      (32+ random chars)              AWS Secrets Manager (KMS)   |
| JWT_ACCESS_EXPIRATION      Config      900s (15 min)                   Container Env               |
| JWT_REFRESH_EXPIRATION     Config      7d                              Container Env               |
| CORS_ORIGINS               Config      https://gypsym.com,https://...  Injected by ConfigMap       |
| REDIS_HOST                 Config      redis.cluster.local             Injected by ConfigMap       |
| REDIS_PORT                 Config      6379                            Injected by ConfigMap       |
| REDIS_PASSWORD             Secret      (random token)                  AWS Secrets Manager         |
| AWS_REGION                 Config      us-east-1                       Injected by Instance Profile|
| S3_MEDIA_BUCKET            Config      gypsym-prod-media-public        Injected by ConfigMap       |
| S3_PRIVATE_BUCKET          Config      gypsym-prod-private             Injected by ConfigMap       |
| SES_FROM_EMAIL             Config      advisory@gypsym.com             Injected by ConfigMap       |
| REVALIDATION_TOKEN         Secret      (64-char hex token)             AWS Secrets Manager         |
+----------------------------------------------------------------------------------------------------+
```

---

## 4. Container Architecture & Multi-Stage Dockerfiles

### 4.1 Base Design Principles
- **Minimal Attack Surface**: Based on official `node:20-alpine` images with non-root user execution (`USER node`).
- **Deterministic Builds**: Dependency locking via `pnpm-lock.yaml` and frozen lockfile installation.
- **Standalone Output Optimization**: Next.js App Router configured with `output: 'standalone'` in production builds, reducing runtime image size from > 1.2 GB to **< 160 MB**.

---

## 5. Database Operations, Migrations & Connection Pooling

### 5.1 Zero-Downtime Migration Policy (Expand & Contract Pattern)
Direct destructive migrations (`ALTER TABLE DROP COLUMN`, `ALTER TABLE RENAME`) cause immediate 500 errors during blue/green or rolling deployments. Gypsym follows the **Expand and Contract (Phased Migration)** pattern:

```
Phase 1: EXPAND (Deploy DB Migration)
  - Add new column as NULLABLE or with default.
  - Keep old column intact.
  - Deploy migration via CI pipeline job before app code rollouts.

Phase 2: DUAL-WRITE (Deploy App v2)
  - New application code writes to both old and new columns.
  - Reads gracefully fall back to old column if new column is empty.

Phase 3: BACKFILL & SWITCH
  - Background asynchronous task backfills existing rows from old to new column.
  - Application code switches reads exclusively to new column.

Phase 4: CONTRACT (Next Release Cycle)
  - Drop old column and remove legacy compatibility code.
```

### 5.2 PgBouncer Connection Pooling Configuration
Prisma generates dedicated client connections that can rapidly exhaust PostgreSQL's max connections (`max_connections = 500`). We deploy a dedicated PgBouncer sidecar/service:
- **Pool Mode**: `transaction` (ideal for REST APIs).
- **Default Pool Size**: 50 active connections per replica.
- **Reserve Pool**: 10 connections for traffic surges.
- **Max Client Connections**: 5,000 concurrent client connections routed into 100 pooled PostgreSQL connections.
- **Configuration Note**: Prisma migrations use `DIRECT_URL` (direct port `5432`) to bypass PgBouncer, while application queries use `DATABASE_URL` (PgBouncer port `6432` with `?pgbouncer=true`).

### 5.3 Automated Backups & Disaster Recovery (DR)
- **Continuous Archiving**: PostgreSQL Write-Ahead Logs (WAL) continuously shipped to Amazon S3 via `pgBackRest` / AWS Aurora continuous backup.
- **Point-in-Time Recovery (PITR)**: 35-day retention window enabling recovery to any designated second within the past month.
- **Automated Daily Snapshots**: Encrypted Amazon RDS snapshots executed daily at 02:00 UTC and replicated to secondary AWS region (`eu-west-1`).
- **Disaster Recovery Targets**:
  - **RPO (Recovery Point Objective)**: **< 5 minutes** of data loss.
  - **RTO (Recovery Time Objective)**: **< 30 minutes** to complete full cross-region failover.

---

## 6. Comprehensive CI/CD Pipeline Architecture

```mermaid
flowchart LR
    subgraph CI ["Continuous Integration (PR & Branch Gate)"]
        Lint["1. Lint & Format"]
        Typecheck["2. Strict Typecheck"]
        Test["3. Unit & Component Tests"]
        Build["4. Docker Multi-Stage Build"]
        MigrateVal["5. Migration Dry-Run"]
        SecScan["6. Security & SAST Scan"]
    end

    subgraph CD ["Continuous Deployment (Staging & Production)"]
        DeployStaging["7. Deploy to Staging"]
        SmokeTest["8. Automated Smoke & E2E"]
        Canary["9. Blue/Green Canary Deploy"]
        HealthCheck["10. Health & Metric Gates"]
        Promote["11. 100% Traffic Switch"]
        Rollback["Auto-Rollback (On Alert)"]
    end

    Lint --> Typecheck
    Typecheck --> Test
    Test --> Build
    Build --> MigrateVal
    MigrateVal --> SecScan
    SecScan --> DeployStaging
    DeployStaging --> SmokeTest
    SmokeTest --> Canary
    Canary --> HealthCheck
    HealthCheck -- SLA Met --> Promote
    HealthCheck -- 5xx Spikes / Failed Health --> Rollback
```

### 6.1 CI/CD Pipeline Stages

1. **Lint**: ESLint, Prettier, and custom workspace linter enforcement. Zero warnings tolerated.
2. **Typecheck**: `pnpm -r run typecheck` (`tsc --noEmit`) across monorepo packages.
3. **Test**: Jest / Vitest unit tests, Supertest API integration suites. Minimum 90% coverage on core logic.
4. **Build**: Docker build with buildkit layer caching. Image pushed to Amazon ECR tagged with commit SHA.
5. **Migration Validation**: Executes `prisma migrate status` and dry-run migration against an ephemeral Testcontainers Postgres instance.
6. **Security Scan**:
   - `snyk test` / `trivy image` scanning for container and dependency vulnerabilities (zero HIGH/CRITICAL allowed).
   - `gitleaks` scanning for accidental secret leakage.
7. **Deploy to Staging**: Helm/Kustomize deployment to staging cluster.
8. **Automated Smoke & E2E**: Playwright headless browser test suite executing the 16 critical enterprise flows against staging.
9. **Blue/Green Canary Deploy**:
   - Launch green deployment pods (0% public traffic).
   - Verify green pod health checks (`/api/v1/health/liveness` and `/api/v1/health/readiness`).
   - Shift 10% traffic to Green for 5 minutes.
10. **Health & Metric Gates**: Automated verification of Prometheus telemetry:
    - 5xx error rate < 0.05%.
    - Latency p95 < 150ms.
    - CPU / Memory within nominal baseline.
11. **100% Traffic Switch**: ALB routing switched to Green. Blue pods retained for 30 minutes in idle standby before decommissioning.
12. **Automated Rollback**: If health checks or metric gates fail at any point during Canary, ALB instantly reverts 100% traffic to Blue.

---

## 7. Observability, Logging, Monitoring & Alerting

### 7.1 Structured JSON Logging
- Every application utilizes `pino` with JSON structured logging to stdout.
- Log entries include standardized context:
  ```json
  {
    "level": "info",
    "timestamp": "2026-09-10T13:00:00.000Z",
    "service": "gypsym-api",
    "environment": "production",
    "correlationId": "c4b12a88-25f1-4c12-9c1a-821f8a8471b2",
    "requestId": "req-988124",
    "method": "POST",
    "path": "/api/v1/contact",
    "statusCode": 201,
    "responseTimeMs": 42.6,
    "actorId": "anonymous",
    "message": "Executive briefing inquiry received"
  }
  ```
- **Log Aggregator**: Vector / FluentBit daemonsets forward logs to **Amazon OpenSearch** / **Datadog** with 90-day hot storage and 365-day cold S3 glacier archive.

### 7.2 OpenTelemetry Metrics & Prometheus
Expose standardized metrics endpoint (`/metrics` restricted to internal scrapers):
- `http_requests_total{service, method, path, status}`
- `http_request_duration_seconds_bucket{service, path}`
- `database_query_duration_seconds{query_type}`
- `redis_cache_hits_total` / `redis_cache_misses_total`
- `active_sessions_gauge`

### 7.3 Alerting Rules & Escalation Matrix

| Alert Name | Condition | Severity | Channel | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **HighErrorRate** | 5xx errors > 1.0% for 2 consecutive minutes | **P1 - CRITICAL** | PagerDuty On-Call + Slack `#incident-war-room` | Immediate automated traffic rollback or emergency triage |
| **LatencySlaBreach** | API p95 latency > 300ms for 5 minutes | **P2 - HIGH** | PagerDuty + Slack `#eng-alerts` | Investigate DB locks or Redis connection saturation |
| **DatabasePoolSaturation** | PgBouncer waiting clients > 25 for 3 min | **P2 - HIGH** | Slack `#eng-alerts` | Scale API pods or increase PgBouncer pool limits |
| **PodCrashLoop** | Container restarts > 3 in 10 minutes | **P2 - HIGH** | Slack `#eng-alerts` | Check OOMKilled or unhandled bootstrap exceptions |
| **DiskSpaceExhaustion** | Database or S3 storage quota > 85% | **P3 - WARNING** | Slack `#devops-ops` | Expand provisioned EBS / cleanup temporary scratch directories |

---

## 8. Operational Runbooks

---

### Runbook 1: Production Deployment & Zero-Downtime Migration

```bash
# Step 1: Validate Git Working State & Target Release Tag
git checkout main && git pull origin main
export RELEASE_TAG="v2.4.0"
git tag -a $RELEASE_TAG -m "Production Release $RELEASE_TAG"
git push origin $RELEASE_TAG

# Step 2: Trigger CI/CD Pipeline
# GitHub Actions runs lint, typecheck, test, and container builds.
# Monitor progress: https://github.com/gypsym/gypsym-advance-site/actions

# Step 3: Run Database Migrations (Pre-Deployment Phase)
kubectl run prisma-migration-job \
  --image=123456789012.dkr.ecr.us-east-1.amazonaws.com/gypsym-api:$RELEASE_TAG \
  --restart=Never \
  --env-from=secret/gypsym-api-secrets \
  --command -- pnpm --filter @gypsym/database exec prisma migrate deploy

# Step 4: Verify Migration Success
kubectl logs -f job/prisma-migration-job
kubectl delete pod prisma-migration-job

# Step 5: Deploy Green Release (10% Canary)
kubectl set image deployment/gypsym-api-green api=123456789012.dkr.ecr.us-east-1.amazonaws.com/gypsym-api:$RELEASE_TAG
kubectl rollout status deployment/gypsym-api-green --timeout=180s

# Step 6: Verify Health Probes
curl -fsS https://green.api.gypsym.com/api/v1/health/readiness | jq .

# Step 7: Complete Traffic Shift (100% Green)
kubectl apply -f k8s/production/traffic-split-100-green.yaml
```

---

### Runbook 2: Automated Incident Rollback

```bash
# TRIGGER: High 5xx error rate or catastrophic application defect detected.

# Step 1: Instantly Revert Traffic Routing to Stable Blue
kubectl apply -f k8s/production/traffic-split-100-blue.yaml

# Step 2: Verify Public Production Traffic Stabilizes
watch -n 1 "curl -sI https://gypsym.com/api/v1/health/readiness | head -n 1"

# Step 3: Notify Engineering & Incident Commander
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"🚨 INCIDENT ROLLBACK: Production traffic successfully reverted to Blue. Incident triage underway."}' \
  $SLACK_INCIDENT_WEBHOOK_URL

# Step 4: Gather Forensic Telemetry
kubectl logs -l app=gypsym-api-green --tail=500 > rollback-forensic-logs.json
```

---

### Runbook 3: Disaster Recovery & Database Point-in-Time Restore (PITR)

```bash
# SCENARIO: Accidental table truncation or data corruption at 12:45:00 UTC.

# Step 1: Determine Recovery Target Timestamp
export RECOVERY_TIME="2026-09-10T12:44:30.000Z"

# Step 2: Launch Ephemeral Restored Aurora Instance
aws rds restore-db-cluster-to-point-in-time \
  --source-db-cluster-identifier gypsym-prod-aurora-cluster \
  --target-db-cluster-identifier gypsym-prod-aurora-restored-pitr \
  --restore-to-time $RECOVERY_TIME \
  --db-subnet-group-name gypsym-prod-db-subnets \
  --vpc-security-group-ids sg-0123456789abcdef0

# Step 3: Verify Data Integrity in Restored Instance
# Connect to gypsym-prod-aurora-restored-pitr and assert data consistency.

# Step 4: Switch Application Connection Endpoint
aws secretsmanager update-secret \
  --secret-id gypsym/prod/database_url \
  --secret-string "postgresql://app_user:pass@gypsym-prod-aurora-restored-pitr...:5432/gypsym_prod"

# Step 5: Rolling Restart of API Services
kubectl rollout restart deployment/gypsym-api
```

---

### Runbook 4: Zero-Downtime Secret Rotation

```bash
# PROCEDURE: Rotating JWT Signing Secrets & Database Passwords

# 1. JWT Rotation (Key Versioning)
# - Inject new JWT_ACCESS_SECRET_V2 into AWS Secrets Manager.
# - API verifies signatures against V1 OR V2, but signs new tokens with V2.
# - Wait 15 minutes (max lifespan of V1 access tokens).
# - Decommission V1 secret. Zero logged-out active sessions.

# 2. Database Password Rotation (Dual User Strategy)
# - PostgreSQL maintains app_user_a and app_user_b.
# - Generate new credentials for app_user_b.
# - Update AWS Secrets Manager to reference app_user_b.
# - Perform rolling restart of API deployment.
# - Verify zero connection drops via PgBouncer telemetry.
# - Revoke legacy credentials on app_user_a.
```
