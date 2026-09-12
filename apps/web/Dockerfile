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

# Copy Monorepo Configurations & Packages
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/tsconfig ./packages/tsconfig
COPY packages/shared-types ./packages/shared-types
COPY packages/database ./packages/database
COPY apps/web ./apps/web

# Install Dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Generate Prisma Client & Build Packages
RUN pnpm --filter @gypsym/shared-types run build
RUN pnpm --filter @gypsym/database exec prisma generate

# Build Next.js Web Standalone Application
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @gypsym/web run build

# =============================================================
# Stage 3: Minimal Production Runtime
# =============================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Security: Non-Root Execution
USER node

# Copy Standalone Output & Static Chunks
COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=node:node /app/apps/web/public ./apps/web/public

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "apps/web/server.js"]
