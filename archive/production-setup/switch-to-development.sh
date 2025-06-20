#!/bin/bash

echo "🔄 Switching to development environment..."

# Backup current .env
if [ -f .env ]; then
    cp .env .env.backup
    echo "📦 Backed up current .env to .env.backup"
fi

# Copy development config to .env
if [ -f .env.development.local ]; then
    cp .env.development.local .env
    echo "✅ Switched to development database configuration"
    echo "🟢 You are now using DEVELOPMENT database"
    echo "💡 Run 'npm run prisma:studio:dev' to verify connection"
else
    echo "❌ .env.development.local not found!"
    exit 1
fi