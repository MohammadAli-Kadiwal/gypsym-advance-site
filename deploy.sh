#!/usr/bin/env bash
# ==============================================================================
# Gypsym Technology — Production Deployment Script
# PM2 Port Mapping:
#   - gypsym-web   : Port 3002 (Public: https://www.gypsym.com/)
#   - gypsym-admin : Port 3003 (Admin:  https://www.gypsym.com/admin)
#   - gypsym-api   : Port 3004 (API:    https://www.gypsym.com/api)
# Usage:
#   bash deploy.sh          # Full deployment (Web on 3002, Admin on 3003, API on 3004)
#   bash deploy.sh web      # Deploy Next.js Web on port 3002
#   bash deploy.sh admin    # Deploy Admin Panel on port 3003
#   bash deploy.sh api      # Deploy NestJS Core API on port 3004
# ==============================================================================

set -eo pipefail

# Text formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

TARGET_SERVICE="${1:-all}"
WEB_PORT=3002
ADMIN_PORT=3003
API_PORT=3004

echo -e "${BOLD}${BLUE}==============================================================================${RESET}"
echo -e "${BOLD}${BLUE}🚀 GYPSYM TECHNOLOGY — PRODUCTION DEPLOYMENT ENGINE${RESET}"
echo -e "${BOLD}${BLUE}   Web Process   : gypsym-web   -> 127.0.0.1:${WEB_PORT} (https://www.gypsym.com/)${RESET}"
echo -e "${BOLD}${BLUE}   Admin Process : gypsym-admin -> 127.0.0.1:${ADMIN_PORT} (https://www.gypsym.com/admin)${RESET}"
echo -e "${BOLD}${BLUE}   API Process   : gypsym-api   -> 127.0.0.1:${API_PORT} (https://www.gypsym.com/api)${RESET}"
echo -e "${BOLD}${BLUE}   Target Mode   : ${TARGET_SERVICE}${RESET}"
echo -e "${BOLD}${BLUE}==============================================================================${RESET}"

# ------------------------------------------------------------------------------
# 1. Environment & Prerequisite Checks
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}[1/6] Verifying system prerequisites...${RESET}"

command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18 or 20 LTS.${RESET}"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo -e "${YELLOW}⚠️  pnpm not found. Installing globally via npm...${RESET}"; npm install -g pnpm; }
command -v pm2  >/dev/null 2>&1 || { echo -e "${YELLOW}⚠️  PM2 not found. Installing globally via npm...${RESET}"; npm install -g pm2; }

NODE_VERSION=$(node -v)
PNPM_VERSION=$(pnpm -v)
echo -e "   Node Version : ${GREEN}${NODE_VERSION}${RESET}"
echo -e "   pnpm Version : ${GREEN}${PNPM_VERSION}${RESET}"
echo -e "   PM2 Status   : ${GREEN}Installed${RESET}"

# ------------------------------------------------------------------------------
# 2. Production Environment Files Setup
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}[2/6] Synchronizing production environment variables...${RESET}"

if [ ! -f .env ] && [ -f .env.production ]; then
    echo -e "   Copying root .env.production -> .env"
    cp .env.production .env
fi

if [ ! -f apps/web/.env ] && [ -f apps/web/.env.production ]; then
    echo -e "   Copying apps/web/.env.production -> apps/web/.env"
    cp apps/web/.env.production apps/web/.env
fi

if [ ! -f apps/api/.env ] && [ -f apps/api/.env.production ]; then
    echo -e "   Copying apps/api/.env.production -> apps/api/.env"
    cp apps/api/.env.production apps/api/.env
fi

if [ ! -f apps/admin/.env ] && [ -f apps/admin/.env.production ]; then
    echo -e "   Copying apps/admin/.env.production -> apps/admin/.env"
    cp apps/admin/.env.production apps/admin/.env
fi

echo -e "   ${GREEN}✓ Environment files configured.${RESET}"

# ------------------------------------------------------------------------------
# 3. Install Dependencies
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}[3/6] Installing monorepo dependencies...${RESET}"
pnpm install

# ------------------------------------------------------------------------------
# 4. Workspace Builds & Prisma Generation
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}[4/6] Building required workspace modules & Prisma client...${RESET}"

# 1. Prisma generate
echo -e "   Generating Prisma Client..."
pnpm --filter @gypsym/database run db:generate || pnpm --filter @gypsym/database exec prisma generate || npx prisma@5.22.0 generate --schema=packages/database/prisma/schema.prisma

# 2. Database package build (generates @gypsym/database typings and compiled exports)
echo -e "   Building @gypsym/database..."
pnpm --filter @gypsym/database build

# 3. Shared types build
echo -e "   Building @gypsym/shared-types..."
pnpm --filter @gypsym/shared-types build

# Target builds
if [ "$TARGET_SERVICE" = "admin" ]; then
    echo -e "   Building Next.js Admin Workstation (Port ${ADMIN_PORT}, basePath: /admin)..."
    pnpm --filter admin build
elif [ "$TARGET_SERVICE" = "web" ]; then
    echo -e "   Building Next.js Web App (Port ${WEB_PORT})..."
    pnpm --filter web build
elif [ "$TARGET_SERVICE" = "api" ]; then
    echo -e "   Building NestJS Core API Engine (Port ${API_PORT})..."
    pnpm --filter api build
else
    echo -e "   Building Next.js Web App (Port ${WEB_PORT})..."
    pnpm --filter web build

    echo -e "   Building Next.js Admin Workstation (Port ${ADMIN_PORT}, basePath: /admin)..."
    pnpm --filter admin build

    echo -e "   Building NestJS Core API Engine (Port ${API_PORT})..."
    pnpm --filter api build
fi

echo -e "   ${GREEN}✓ Build completed successfully.${RESET}"

# ------------------------------------------------------------------------------
# 5. Zero-Downtime PM2 Deployment
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}[5/6] Deploying services via PM2...${RESET}"

if [ "$TARGET_SERVICE" = "admin" ]; then
    if pm2 describe gypsym-admin > /dev/null 2>&1; then
        echo -e "   Reloading gypsym-admin on port ${ADMIN_PORT}..."
        pm2 reload ecosystem.config.js --only gypsym-admin --update-env
    else
        echo -e "   Starting gypsym-admin on port ${ADMIN_PORT}..."
        pm2 start ecosystem.config.js --only gypsym-admin
    fi
elif [ "$TARGET_SERVICE" = "web" ]; then
    if pm2 describe gypsym-web > /dev/null 2>&1; then
        echo -e "   Reloading gypsym-web on port ${WEB_PORT}..."
        pm2 reload ecosystem.config.js --only gypsym-web --update-env
    else
        echo -e "   Starting gypsym-web on port ${WEB_PORT}..."
        pm2 start ecosystem.config.js --only gypsym-web
    fi
elif [ "$TARGET_SERVICE" = "api" ]; then
    if pm2 describe gypsym-api > /dev/null 2>&1; then
        echo -e "   Reloading gypsym-api on port ${API_PORT}..."
        pm2 reload ecosystem.config.js --only gypsym-api --update-env
    else
        echo -e "   Starting gypsym-api on port ${API_PORT}..."
        pm2 start ecosystem.config.js --only gypsym-api
    fi
else
    echo -e "   Starting / Reloading all ecosystem processes..."
    pm2 startOrReload ecosystem.config.js --update-env
fi

pm2 save
echo -e "   ${GREEN}✓ PM2 process state saved.${RESET}"

# ------------------------------------------------------------------------------
# 6. Nginx Reload & Health Verification
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}[6/6] Verifying service health...${RESET}"

# Attempt Nginx reload if running on server with sudo access
if command -v nginx >/dev/null 2>&1; then
    if [ -f nginx.conf ] && [ -d /etc/nginx/sites-available ]; then
        echo -e "   Syncing nginx.conf to /etc/nginx/sites-available/gypsym.conf..."
        sudo cp nginx.conf /etc/nginx/sites-available/gypsym.conf || true
        sudo ln -sf /etc/nginx/sites-available/gypsym.conf /etc/nginx/sites-enabled/gypsym.conf || true
        sudo nginx -t && sudo systemctl reload nginx || echo -e "   ${YELLOW}Notice: Run 'sudo nginx -t && sudo systemctl reload nginx' to apply Nginx changes.${RESET}"
    fi
fi

sleep 3

if [ "$TARGET_SERVICE" = "web" ] || [ "$TARGET_SERVICE" = "all" ]; then
    WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${WEB_PORT}/" || echo "000")
    echo -e "   Web   (127.0.0.1:${WEB_PORT})   : HTTP ${WEB_STATUS}"
fi

if [ "$TARGET_SERVICE" = "admin" ] || [ "$TARGET_SERVICE" = "all" ]; then
    ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${ADMIN_PORT}/admin" || echo "000")
    echo -e "   Admin (127.0.0.1:${ADMIN_PORT}/admin) : HTTP ${ADMIN_STATUS}"
fi

if [ "$TARGET_SERVICE" = "api" ] || [ "$TARGET_SERVICE" = "all" ]; then
    API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${API_PORT}/api/v1/health" || curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${API_PORT}/health" || echo "000")
    echo -e "   API   (127.0.0.1:${API_PORT})   : HTTP ${API_STATUS}"
fi

echo -e "\n${BOLD}${GREEN}==============================================================================${RESET}"
echo -e "${BOLD}${GREEN}🎉 DEPLOYMENT COMPLETE!${RESET}"
echo -e "${BOLD}   Web Site    : https://www.gypsym.com/       -> PM2 Port ${WEB_PORT}${RESET}"
echo -e "${BOLD}   Admin Panel : https://www.gypsym.com/admin  -> PM2 Port ${ADMIN_PORT}${RESET}"
echo -e "${BOLD}   Core API    : https://www.gypsym.com/api    -> PM2 Port ${API_PORT}${RESET}"
echo -e "${BOLD}   Redirect    : admin.gypsym.com             -> 301 Redirects to /admin${RESET}"
echo -e "${BOLD}${GREEN}==============================================================================${RESET}"
echo -e "\nTo inspect live logs: ${BOLD}pm2 logs${RESET}"
echo -e "To check process status: ${BOLD}pm2 status${RESET}\n"
