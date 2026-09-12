# =============================================================
# Stage 1: Prerequisite & Dependency Installation
# =============================================================
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# =============================================================
# Stage 2: Builder
# =============================================================
FROM base AS builder
WORKDIR /app

# Copy Monorepo Package Declarations
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/tsconfig ./packages/tsconfig
COPY packages/shared-types ./packages/shared-types
COPY packages/database ./packages/database
COPY apps/api ./apps/api

# Install Dependencies with Frozen Lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Generate Prisma Client & Build Packages
RUN pnpm --filter @gypsym/shared-types run build
RUN pnpm --filter @gypsym/database exec prisma generate

# Build NestJS API Application
RUN pnpm --filter @gypsym/api run build

# Deploy Production Dependency Pruning
RUN pnpm --filter @gypsym/api --prod deploy /app/pruned-api

# =============================================================
# Stage 3: Minimal Production Runtime
# =============================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV API_PREFIX=/api/v1

# Security: Non-Root Execution
USER node

# Copy Built Artifacts
COPY --from=builder --chown=node:node /app/apps/api/dist ./dist
COPY --from=builder --chown=node:node /app/pruned-api/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/api/package.json ./package.json

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health/liveness || exit 1

CMD ["node", "dist/main.js"]
