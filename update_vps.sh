#!/bin/bash
# ==============================================================================
# ExpTracker — Production VPS Update & Recovery Script
# ==============================================================================
set -e

echo "🚀 Starting ExpTracker update on VPS..."

cd /var/www/exptracker

# 1. Pull latest code from GitHub
echo "📥 Pulling latest git commits..."
git pull origin main

# 2. Update Backend
echo "⚙️ Updating backend dependencies, prisma client, and database schema..."
cd /var/www/exptracker/backend
npm install
npx prisma generate
npx prisma db push --accept-data-loss
npm run build

# 3. Update Frontend
echo "🎨 Updating frontend SPA..."
cd /var/www/exptracker/frontend
npm install
npm run build

# 4. Restart PM2 on Port 3006
echo "🔄 Restarting API via PM2..."
cd /var/www/exptracker
pm2 restart ecosystem.config.cjs || pm2 start ecosystem.config.cjs
pm2 save

echo "=================================================================="
echo "🎉 Update completed! Checking status..."
pm2 status
echo "=================================================================="
echo "API Health Check:"
curl -s http://localhost:3006/health || echo "API failed to respond"
echo ""
