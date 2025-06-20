# Development Environment Setup

This document describes how to safely develop on this project without affecting production data.

## Environment Configuration

The project supports separate development and production databases:

- **Development**: PostgreSQL at `82.180.137.92:5438`
- **Production**: Supabase PostgreSQL (production data)

## Quick Start

### 1. Switch to Development Environment
```bash
npm run env:dev
# or manually: bash scripts/switch-to-development.sh
```

### 2. Run Development Server
```bash
npm run dev
# This automatically uses NODE_ENV=development
```

### 3. Database Operations (Development)
```bash
# Run migrations on development database
npm run prisma:migrate:dev

# Seed with test data
npm run db:seed:dev

# Open Prisma Studio for development database
npm run prisma:studio:dev
```

## Environment Switching

### Switch to Development
```bash
npm run env:dev
npm run db:seed:dev  # Optional: seed with test data
npm run dev
```

### Switch to Production (Use with Caution!)
```bash
npm run env:prod
npm run dev:prod  # Uses production database
```

## Safety Features

### 1. Environment Indicator
- Green badge (🟢 DEVELOPMENT) for development
- Red badge (🔴 PRODUCTION) for production
- Visible in top-right corner of the application

### 2. Environment Warnings
- Automatic detection of environment mismatches
- Warnings displayed when development mode connects to production DB

### 3. Database Connection Validation
- API endpoint `/api/environment` for checking current setup
- Validates database connectivity and environment consistency

## Available Scripts

### Development
- `npm run dev` - Start development server with development database
- `npm run dev:prod` - Start development server with production database
- `npm run prisma:migrate:dev` - Run migrations on development database
- `npm run prisma:studio:dev` - Open Prisma Studio for development database
- `npm run db:seed:dev` - Seed development database with test data

### Production
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:migrate:prod` - Deploy migrations to production
- `npm run prisma:studio` - Open Prisma Studio for production database

### Environment Management
- `npm run env:dev` - Switch to development environment
- `npm run env:prod` - Switch to production environment

## Environment Files

- `.env` - Active configuration (auto-managed by scripts)
- `.env.development.local` - Development database configuration
- `.env.production.local` - Production database configuration
- `.env.production.backup` - Backup of production .env file

## Development Database Schema

The development database contains:
- 30 test trees across 3 sections
- Sample logs with yield tracking data
- Reference data (varieties, fertilizers, pesticides)
- Cost tracking examples
- All necessary tables and relationships

## Safety Checklist

Before making changes:
1. ✅ Check environment indicator shows "🟢 DEVELOPMENT"
2. ✅ Verify no environment warnings are displayed
3. ✅ Confirm database URL points to development server
4. ✅ Test changes on development data first

## Troubleshooting

### Environment Mismatch
If you see warnings about environment mismatch:
```bash
# Switch to development
npm run env:dev
# Restart development server
npm run dev
```

### Database Connection Issues
```bash
# Check environment status
curl http://localhost:3000/api/environment

# Reset development database
npm run prisma:migrate:dev
npm run db:seed:dev
```

### Missing Development Data
```bash
# Re-seed development database
npm run db:seed:dev
```

## Best Practices

1. **Always develop on development database** - Never modify production data directly
2. **Test migrations on development first** - Verify schema changes work before production
3. **Use environment indicators** - Always verify which environment you're connected to
4. **Backup before switching** - Scripts automatically backup current configuration
5. **Review environment warnings** - Address any environment mismatch warnings immediately

## Production Deployment

When ready to deploy to production:
1. Test all changes thoroughly on development
2. Run build and tests: `npm run build && npm run lint`
3. Switch to production: `npm run env:prod`
4. Run production migrations: `npm run prisma:migrate:prod`
5. Deploy application code

## Support

If you encounter issues with environment setup:
1. Check this documentation
2. Verify environment files exist and contain correct credentials
3. Use environment API endpoint to diagnose connection issues
4. Contact the development team for assistance