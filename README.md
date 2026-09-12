# Gypsym Technology — Planetary-Scale Enterprise Digital Platform

[![CI/CD Pipeline](https://github.com/gypsym/gypsym-advance-site/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/gypsym/gypsym-advance-site/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-ea2845.svg)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)

Gypsym Technology is an enterprise-grade digital platform engineered for mission-critical operations, sovereign AI orchestration, and zero-downtime distributed systems.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Node & Package Manager Requirements](#2-node--package-manager-requirements)
3. [Installation](#3-installation)
4. [Environment Configuration](#4-environment-configuration)
5. [Database Setup](#5-database-setup)
6. [Prisma Migration](#6-prisma-migration)
7. [Development Seed](#7-development-seed)
8. [Production Bootstrap](#8-production-bootstrap)
9. [Running Web](#9-running-web)
10. [Running Admin](#10-running-admin)
11. [Running API](#11-running-api)
12. [Build](#12-build)
13. [Test](#13-test)
14. [Production Deployment](#14-production-deployment)
15. [Environment Variable Reference](#15-environment-variable-reference)
16. [Admin Login & Bootstrap Process](#16-admin-login--bootstrap-process)
17. [Theme & Brand Configuration](#17-theme--brand-configuration)
18. [Troubleshooting](#18-troubleshooting)

---

## 1. Prerequisites

Before installing the platform, ensure your workstation or server environment meets the following minimum requirements:

* **Operating System**: Linux (Ubuntu 22.04+ / Debian 12+), macOS (v13+), or Windows 11 with WSL2 / PowerShell 7.
* **PostgreSQL**: Version 15.0 or newer (with `uuid-ossp` and `pgcrypto` extensions enabled).
* **Redis**: Version 7.0 or newer (required for token revocation, rate limiting, and BullMQ queues).
* **Docker & Docker Compose**: Docker Engine v24+ and Docker Compose v2.20+ (optional, for containerized local services).
* **Git**: Version 2.38+ with LFS support.

---

## 2. Node & Package Manager Requirements

* **Node.js**: `v20.x` or `v22.x` Active LTS (Node 20.18.0+ recommended).
* **Package Manager**: `pnpm` version `9.x` is strictly required. Do not use npm or yarn.

```bash
# Verify Node and pnpm versions
node -v   # Must output >= v20.0.0
pnpm -v   # Must output >= 9.0.0

# Install pnpm if not already available
corepack enable
corepack prepare pnpm@latest --activate
```

---

## 3. Installation

Clone the repository and install dependencies using pnpm workspace commands:

```bash
# Clone repository
git clone https://github.com/gypsym/gypsym-advance-site.git
cd gypsym-advance-site

# Install all workspace dependencies
pnpm install
```

---

## 4. Environment Configuration

The monorepo requires environment files across workspace apps. Templates with zero committed secrets are provided:

```bash
# Root environment configuration
cp .env.example .env

# App-specific environment configurations
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/admin/.env.example apps/admin/.env
```

> **CRITICAL SECURITY DIRECTIVE**: Never commit `.env`, `.env.local`, `.env.production`, or real API secrets to version control. Centralized runtime validation automatically terminates processes if secrets are missing or fail complexity checks.

---

## 5. Database Setup

Ensure PostgreSQL and Redis are running. You can launch them locally using Docker Compose:

```bash
# Launch PostgreSQL and Redis containers
docker compose up -d postgres redis

# Verify connectivity
docker compose ps
```

Configure your `DATABASE_URL` and `DIRECT_URL` in `apps/api/.env` and `.env`:

```env
DATABASE_URL="postgresql://gypsym_user:YOUR_SECURE_PASSWORD@localhost:5432/gypsym_production?schema=public&connection_limit=20&pool_timeout=10"
DIRECT_URL="postgresql://gypsym_user:YOUR_SECURE_PASSWORD@localhost:5432/gypsym_production?schema=public"
```

---

## 6. Prisma Migration

Deploy version-controlled database migrations.

> **PRODUCTION DIRECTIVE**: Never use `prisma db push` in production. Always execute `prisma migrate deploy` to guarantee deterministic schema application.

```bash
# Generate Prisma Client types
pnpm --filter @gypsym/database run db:generate

# In Development (creates/applies pending migration files):
pnpm --filter @gypsym/database run db:migrate

# In Production / Staging CI/CD (applies existing migrations safely):
pnpm --filter @gypsym/database run db:deploy
```

---

## 7. Development Seed

The development seed populates the database with realistic sample CMS pages, domain services, thought leadership whitepapers, job requisitions, and demo user accounts:

```bash
# Run idempotent development seed
pnpm --filter @gypsym/database run db:seed
```

Development credentials generated:
* **Admin Email**: `admin@gypsym.com`
* **Admin Password**: `GypsymEnterprise2026!`

---

## 8. Production Bootstrap

The production bootstrap script performs zero-destructive idempotent initialization of system roles, permissions, baseline site settings, default branding tokens, and the initial Super Administrator:

```bash
# Ensure required production environment variables are provided
export SEED_MODE="production"
export SEED_ADMIN_EMAIL="secops-bootstrap@yourdomain.com"
export SEED_ADMIN_PASSWORD="REPLACE_WITH_CRYPTOGRAPHICALLY_SECURE_PASSWORD"
export SEED_ADMIN_NAME="Enterprise SecOps"

# Execute production bootstrap
pnpm --filter @gypsym/database run db:seed:prod
```

* Script verifies required credentials exist; terminates if missing.
* Passwords are salted and hashed with `crypto.scryptSync`.
* Re-running is 100% idempotent: existing data is preserved without overwriting.

---

## 9. Running Web

The public Next.js website runs on port `3000`:

```bash
# Development mode with hot module reloading
pnpm --filter web run dev

# Production mode
pnpm --filter web run build
pnpm --filter web run start
```
Access at: `http://localhost:3000`

---

## 10. Running Admin

The Next.js Enterprise Admin Workstation runs on port `3001`:

```bash
# Development mode
pnpm --filter admin run dev

# Production mode
pnpm --filter admin run build
pnpm --filter admin run start
```
Access at: `http://localhost:3001`

---

## 11. Running API

The NestJS Core API runs on port `4000`:

```bash
# Development mode with watcher
pnpm --filter api run start:dev

# Production mode
pnpm --filter api run build
pnpm --filter api run start:prod
```
Access at: `http://localhost:4000/api/v1`

---

## 12. Build

Execute full monorepo compilation with type-checking and bundling across all packages:

```bash
# Build all apps and packages via Turborepo
pnpm run build
```

---

## 13. Test

Run comprehensive unit, integration, and security test suites:

```bash
# Run unit tests across packages
pnpm run test

# Run strict TypeScript typechecks
pnpm -r run typecheck

# Run linter
pnpm run lint
```

---

## 14. Production Deployment

Production deployments follow a strict, automated 8-stage gate:

```text
Build (Turborepo)
  ↓
Environment Validation (Zod fail-fast)
  ↓
Prisma Migration Deploy (Zero-downtime schema updates)
  ↓
Production Bootstrap (Optional initial seed)
  ↓
Container Deployment (Non-root distroless Docker)
  ↓
Health Checks (/api/v1/health/liveness & readiness)
  ↓
Edge Routing & Traffic Cutover
```

To run containerized production locally:
```bash
docker compose -f docker-compose.yml up --build -d
```

---

## 15. Environment Variable Reference

| Variable | Scope | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Global | Yes | Execution environment | `production` / `development` |
| `DATABASE_URL` | API/DB | Yes | Pooled PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `DIRECT_URL` | DB | Yes | Direct connection string for Prisma migrations | `postgresql://user:pass@host:5432/db` |
| `JWT_ACCESS_SECRET` | API | Yes (Prod) | 256-bit cryptographically secure secret | 64-char hex string |
| `JWT_REFRESH_SECRET` | API | Yes (Prod) | 256-bit cryptographically secure secret | 64-char hex string |
| `CORS_ORIGINS` | API | Yes | Comma-separated allowed production origins | `https://gypsym.com,https://admin.gypsym.com` |
| `SEED_ADMIN_EMAIL` | DB Seed | Prod Seed | Initial Super Administrator email address | `admin@enterprise.com` |
| `SEED_ADMIN_PASSWORD`| DB Seed | Prod Seed | Initial Super Administrator password | High-entropy string |
| `SEED_ADMIN_NAME` | DB Seed | No | Super Administrator full name | `Enterprise Administrator` |
| `NEXT_PUBLIC_API_URL`| Web/Admin | Yes | Base URL for REST API gateway | `https://api.gypsym.com/api/v1` |
| `NEXT_PUBLIC_WEB_URL`| Admin | Yes | Public website root URL | `https://gypsym.com` |

---

## 16. Admin Login & Bootstrap Process

1. Navigate to the Admin Workstation URL: `http://localhost:3001/login` (or `https://admin.gypsym.com/login`).
2. Log in with the configured `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.
3. Upon first authentication, the **Bootstrap Security Guidance Banner** is displayed prominently:
   * **Step 1**: Rotate default credentials immediately at `/system/users`.
   * **Step 2**: Configure company brand identity, HSL colors, and typography at `/site/branding`.
   * **Step 3**: Verify legal disclosures and registration jurisdictions at `/site/settings`.
   * **Step 4**: Audit navigation hierarchy and SEO templates at `/site/navigation` and `/site/seo`.
4. Once initial settings are customized, dismiss the bootstrap banner to engage standard operational monitoring.

---

## 17. Theme & Brand Configuration

### Global Theme System
* **Light Mode**, **Dark Mode**, and **System Preference** are fully supported.
* Themes are toggled via the header Sun/Moon button and synchronized across localStorage (`gypsym_theme`) and an HTTP cookie (`gypsym_theme`).
* **Zero FOUC (Flash of Unstyled Content)**: An inline blocking script executes in `<head>` before body hydration to prevent visual flashes.
* Contrast ratios strictly comply with **WCAG 2.1 AA** standards across both palettes.

### Dynamic Admin Branding & Runtime Tokens
Administrators configure branding without requiring code redeployment:
1. Navigate to `Admin Workstation -> Site Management -> Brand & Design Tokens`.
2. Configure **Brand Primary**, **Brand Secondary**, **Accent Color**, **Light Background**, and **Dark Background**.
3. All inputs are strictly validated against HSL patterns (`isValidHslString`) to prevent CSS injection.
4. Custom properties are emitted at runtime via `<style id="gypsym-brand-tokens">` and consumed by Tailwind CSS variables (`--primary`, `--background`, `--card`, etc.).
5. If database values are unavailable, the system safely falls back to standard design tokens defined in `DEFAULT_BRAND_TOKENS`.

---

## 18. Troubleshooting

### 1. Database Connection Refused
* Verify PostgreSQL is active: `docker compose ps` or `pg_isready -h localhost -p 5432`.
* Check connection limits and ensure `DATABASE_URL` contains valid credentials.

### 2. Hydration Mismatch Warnings
* The `RootLayout` uses `suppressHydrationWarning` on `<html>` to accommodate dynamic theme classes set before React attaches.
* Ensure no browser extensions are injecting unescaped tags into the DOM.

### 3. Port Already in Use (EADDRINUSE)
* Kill conflicting processes:
  * Port 3000 (Web): `npx kill-port 3000`
  * Port 3001 (Admin): `npx kill-port 3001`
  * Port 4000 (API): `npx kill-port 4000`

### 4. CORS Rejected by API Gateway
* In production, wildcard CORS (`*`) is blocked.
* Verify `CORS_ORIGINS` in `apps/api/.env` explicitly includes the exact protocol and port of `apps/web` and `apps/admin`.

---

© 2026 Gypsym Technology Inc. All rights reserved. Engineering the Global Enterprise.
