#!/bin/bash
# ==============================================================================
# Expense Tracker Application — Automated Production Deployment Script
# ==============================================================================
set -e

echo "🚀 Starting Expense Tracker deployment..."

# 1. Check Docker & Docker Compose installation
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first: https://docs.docker.com/engine/install/"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed or not working."
    exit 1
fi

# 2. Check or initialize .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    
    # Generate secure random secrets for production if openssl is available
    if command -v openssl &> /dev/null; then
        ACCESS_SECRET=$(openssl rand -base64 32)
        REFRESH_SECRET=$(openssl rand -base64 32)
        sed -i "s|JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=\"$ACCESS_SECRET\"|g" .env
        sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=\"$REFRESH_SECRET\"|g" .env
        echo "🔐 Generated secure random JWT access & refresh secrets."
    fi
fi

# 3. Pull / Build and launch Docker Compose containers
echo "📦 Building and starting application services..."
docker compose up -d --build

# 4. Wait for healthy response
echo "⏳ Verifying backend health..."
ATTEMPTS=0
MAX_ATTEMPTS=20
HEALTHY=0

until [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; do
    if docker compose exec -T backend wget -qO- http://localhost:3006/health > /dev/null 2>&1; then
        HEALTHY=1
        break
    fi
    ATTEMPTS=$((ATTEMPTS+1))
    echo "Waiting for services... ($ATTEMPTS/$MAX_ATTEMPTS)"
    sleep 3
done

if [ $HEALTHY -eq 1 ]; then
    echo "=================================================================="
    echo "🎉 Application deployed and running successfully!"
    echo "=================================================================="
    echo "🌐 Web Application URL : http://localhost"
    echo "🔌 Backend REST API    : http://localhost:3006/api/v1"
    echo "📚 Swagger API Docs    : http://localhost:3006/api/docs"
    echo "❤️ Health Check        : http://localhost:3006/health"
    echo "=================================================================="
    echo "Default Credentials:"
    echo "  User A:      usera@example.com / UserA123!@#"
    echo "  User B:      userb@example.com / UserB123!@#"
    echo "  Super Admin: sadiq@shadiqur.bd / Exp_tracker8080##"
    echo "=================================================================="
else
    echo "⚠️ Warning: Service is still initializing. Check logs with: docker compose logs -f"
fi
