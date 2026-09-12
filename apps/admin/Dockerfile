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
COPY apps/admin ./apps/admin

# Install Dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Generate Prisma Client & Build Packages
RUN pnpm --filter @gypsym/shared-types run build
RUN pnpm --filter @gypsym/database exec prisma generate

# Build Next.js Admin Standalone Application
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter admin run build

# =============================================================
# Stage 3: Minimal Production Runtime
# =============================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV NEXT_TELEMETRY_DISABLED=1

# Security: Non-Root Execution
USER node

# Copy Standalone Output & Static Chunks
COPY --from=builder --chown=node:node /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder --chown=node:node /app/apps/admin/public ./apps/admin/public

EXPOSE 3001

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/login || exit 1

CMD ["node", "apps/admin/server.js"]
