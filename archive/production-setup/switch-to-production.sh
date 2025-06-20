#!/bin/bash

echo "🔄 Switching to production environment..."

# Backup current .env
if [ -f .env ]; then
    cp .env .env.backup
    echo "📦 Backed up current .env to .env.backup"
fi

# Copy production config to .env
if [ -f .env.production.local ]; then
    cp .env.production.local .env
    echo "✅ Switched to production database configuration"
    echo "🔴 WARNING: You are now using PRODUCTION database!"
    echo "💡 Run 'npm run prisma:studio' to verify connection"
else
    echo "❌ .env.production.local not found!"
    exit 1
fi