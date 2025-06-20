# Development Workflow Guide

This guide covers the complete workflow for developing and deploying the farm management system safely.

## Daily Development Workflow

### 1. Start Development Session
```bash
# Switch to development environment
npm run env:dev

# Start development server
npm run dev

# Open development database (optional)
npm run prisma:studio:dev
```

### 2. Development Work
- Make your code changes
- Test on development database (safe to experiment)
- Add new features, fix bugs, etc.
- Use the yield tracking and other features with test data

### 3. Database Changes
```bash
# Create new migration (if schema changed)
npm run prisma:migrate:dev

# Seed fresh test data (if needed)
npm run db:seed:dev
```

### 4. Before Committing
```bash
# Run pre-push safety check
npm run pre-push

# If check passes, commit your changes
git add .
git commit -m "Your commit message"
```

### 5. Push to GitHub (Production Repository)
```bash
# Final safety check
npm run pre-push

# Push to GitHub
git push origin main
```

## Environment States

### Development State (Daily Work)
```bash
npm run env:dev  # Sets up development database
npm run dev      # Runs with development environment
```

**Characteristics:**
- 🟢 GREEN environment indicator
- Connected to PostgreSQL development database
- Safe to modify, delete, experiment with data
- 30 test trees with sample yield data

### Production State (For Deployment Testing)
```bash
npm run env:prod  # Sets up production database
npm run dev:prod  # Runs with production environment
```

**Characteristics:**
- 🔴 RED environment indicator
- Connected to Supabase production database
- ⚠️ **CAUTION**: Real production data
- Only use for production deployment testing

### Clean State (For Git Push)
```bash
rm .env          # Or let pre-push script handle it
npm run pre-push # Verifies safe to push
git push         # Push to GitHub
```

**Characteristics:**
- No local .env file
- Repository ready for production deployment
- Environment will be configured by deployment platform

## Safety Systems

### 1. Visual Indicators
- **🟢 DEVELOPMENT**: Safe to experiment
- **🔴 PRODUCTION**: Real data - be careful
- **⚠️ Warnings**: Environment mismatch detected

### 2. Pre-Push Safety Check
The `npm run pre-push` command verifies:
- ✅ No environment files staged for commit
- ✅ No development database configuration in .env
- ✅ Production build works
- ✅ Code passes linting
- ✅ Documentation is complete

### 3. Environment Validation
The system automatically:
- Detects environment mismatches
- Shows warnings for unsafe configurations
- Provides API endpoint (`/api/environment`) for status checks

## Common Scenarios

### Scenario 1: Regular Development
```bash
npm run env:dev
npm run dev
# ... make changes ...
npm run pre-push
git add . && git commit -m "Add feature"
git push
```

### Scenario 2: Database Schema Changes
```bash
npm run env:dev
# ... modify prisma/schema.prisma ...
npm run prisma:migrate:dev
# ... test migration ...
npm run pre-push
git add . && git commit -m "Add new database fields"
git push
```

### Scenario 3: Production Testing
```bash
npm run env:prod
npm run dev:prod
# ... test with production data ...
npm run env:dev  # Switch back to development
```

### Scenario 4: Fresh Development Setup
```bash
npm run env:dev
npm run prisma:migrate:dev
npm run db:seed:dev
npm run dev
```

## Deployment Process

### To Vercel/Netlify (Recommended)
1. **Push to GitHub** (using workflow above)
2. **Connect repository** to deployment platform
3. **Set environment variables** in platform dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_KEY=your_supabase_key
   DATABASE_URL=your_supabase_database_url
   DIRECT_URL=your_supabase_direct_url
   NODE_ENV=production
   ```
4. **Deploy** - platform builds and deploys automatically

### Manual Server Deployment
1. **Push to GitHub** (using workflow above)
2. **Clone on server**:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   npm install
   ```
3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```
4. **Deploy**:
   ```bash
   npm run prisma:migrate:prod
   npm run build
   npm start
   ```

## Troubleshooting

### "Environment mismatch" warning
```bash
npm run env:dev  # Switch to development
# Refresh browser
```

### Pre-push check fails
```bash
# Check what failed
npm run pre-push

# Common fixes:
rm .env                    # Remove local env file
npm run build             # Check build issues
npm run lint              # Fix linting issues
```

### Lost development data
```bash
npm run env:dev
npm run db:seed:dev  # Re-seed test data
```

### Deployment issues
1. Check environment variables in deployment platform
2. Verify Supabase credentials are correct
3. Check deployment platform logs
4. Test locally with production environment

## Best Practices

### Do ✅
- Always start with `npm run env:dev`
- Run `npm run pre-push` before every push
- Test database changes on development first
- Use environment indicators to verify your state
- Keep development and production data separate

### Don't ❌
- Never commit .env files
- Don't modify production data directly
- Don't skip the pre-push safety check
- Don't push with development database configuration
- Don't ignore environment mismatch warnings

## Quick Reference

| Task | Command |
|------|---------|
| Start development | `npm run env:dev && npm run dev` |
| Switch to production testing | `npm run env:prod` |
| Check environment status | `curl localhost:3000/api/environment` |
| Safety check before push | `npm run pre-push` |
| Reset development data | `npm run db:seed:dev` |
| View database | `npm run prisma:studio:dev` |
| Run migrations | `npm run prisma:migrate:dev` |

This workflow ensures you can develop safely while maintaining a production-ready GitHub repository! 🚀