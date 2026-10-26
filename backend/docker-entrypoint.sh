#!/bin/sh
set -e

echo "⏳ Waiting for MySQL database to become ready..."
until npx prisma db push --skip-generate; do
  echo "⚠️ Database connection pending... retrying in 3 seconds."
  sleep 3
done

echo "✅ Database schema synchronized successfully."

echo "🌱 Running database seeding (upserts system categories & initial users)..."
npx tsx prisma/seed.ts || echo "⚠️ Seed script completed or skipped."

echo "🚀 Starting Expense Tracker Backend API server..."
exec "$@"
