#!/usr/bin/env bash
# ==============================================================================
# Gypsym Monorepo — 1-Click VPS Deployment Script (Ubuntu / Debian)
# Usage: sudo bash deploy-setup.sh
# ==============================================================================

set -e

echo "🚀 Starting Gypsym VPS Production Setup..."

# 1. Update and install system dependencies
echo "📦 Installing system packages (Nginx, PostgreSQL, Redis, Node, PM2)..."
apt-get update -y
apt-get install -y curl wget git unzip nginx postgresql postgresql-contrib redis-server certbot python3-certbot-nginx

# 2. Install Node.js 20.x if not present
if ! command -v node &> /dev/null; then
    echo "⬇️  Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# 3. Install pnpm and pm2 globally
echo "⚙️  Installing pnpm & PM2..."
npm install -g pnpm pm2

# 4. Configure local PostgreSQL
echo "🐘 Configuring PostgreSQL database..."
systemctl start postgresql
systemctl enable postgresql

DB_NAME="gypsym_db"
DB_USER="gypsym_user"
DB_PASS="gypsym_production_password_change_me"

sudo -u postgres psql -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}'; END IF; END \$\$;" || true
sudo -u postgres psql -c "SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" || true

# 5. Setup .env if missing
if [ ! -f .env ]; then
    echo "📝 Creating .env from .env.production.example..."
    cp .env.production.example .env
    sed -i "s/YOUR_SECURE_PASSWORD/${DB_PASS}/g" .env
fi

# 6. Install dependencies
echo "📦 Installing production dependencies via pnpm..."
pnpm install

# 7. Prisma Generate & Migrate
echo "🗄️  Running Prisma database migrations & seed..."
pnpm --filter @gypsym/database db:generate
npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma || true

# 8. Start PM2 applications
echo "⚡ Starting services via PM2..."
pm2 start ecosystem.config.js || pm2 reload ecosystem.config.js
pm2 save
pm2 startup systemd -u $USER --hp $HOME || true

# 9. Configure Nginx
echo "🌐 Configuring Nginx reverse proxy..."
if [ -f nginx.conf ]; then
    cp nginx.conf /etc/nginx/sites-available/gypsym.conf
    ln -sf /etc/nginx/sites-available/gypsym.conf /etc/nginx/sites-enabled/gypsym.conf
    rm -f /etc/nginx/sites-enabled/default || true
    nginx -t && systemctl reload nginx
fi

echo "======================================================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo ""
echo "Services status:"
pm2 status
echo ""
echo "Next step for HTTPS (SSL):"
echo "  sudo certbot --nginx -d gypsym.com -d www.gypsym.com -d admin.gypsym.com"
echo "======================================================================"
