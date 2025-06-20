# Production Deployment Guide

This guide covers deploying the farm management system to production environments.

## Environment Setup

### For Production Deployment Platforms (Vercel, Netlify, etc.)

1. **Set Environment Variables in your deployment platform:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
   DATABASE_URL=postgresql://postgres.your-project:password@aws-region.pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres.your-project:password@aws-region.pooler.supabase.com:5432/postgres
   NODE_ENV=production
   ```

2. **Do NOT create a .env file in production** - use your platform's environment variable configuration instead.

## Vercel Deployment

1. **Connect GitHub Repository** to Vercel
2. **Configure Environment Variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from the template above
3. **Deploy** - Vercel will automatically build and deploy

## Netlify Deployment

1. **Connect GitHub Repository** to Netlify
2. **Configure Environment Variables** in Netlify dashboard:
   - Go to Site Settings → Environment Variables
   - Add all variables from the template above
3. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`

## Manual Server Deployment

1. **Clone Repository:**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

4. **Run Database Migrations:**
   ```bash
   npm run prisma:migrate:prod
   ```

5. **Build and Start:**
   ```bash
   npm run build
   npm start
   ```

## Database Migration for Production

**First-time setup:**
```bash
# Run migrations on production database
npm run prisma:migrate:prod

# Optional: Seed with initial data if needed
npm run db:seed
```

**Subsequent deployments:**
```bash
# Deploy new migrations
npm run prisma:migrate:prod
```

## Production Checklist

Before deploying to production:

- [ ] All environment variables configured correctly
- [ ] Database migrations tested on development
- [ ] Build completes successfully (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Environment indicator shows correct environment
- [ ] Database connection verified
- [ ] No development database credentials in code

## Environment Variables Reference

### Required for Production:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_KEY` | Supabase anonymous key | `eyJhbGciOi...` |
| `DATABASE_URL` | Supabase connection URL with pooler | `postgresql://postgres...` |
| `DIRECT_URL` | Direct Supabase connection URL | `postgresql://postgres...` |
| `NODE_ENV` | Environment type | `production` |

### Optional:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |

## Security Notes

1. **Never commit `.env` files** - they're excluded in `.gitignore`
2. **Use deployment platform environment variables** instead of files
3. **Rotate credentials regularly** for production systems
4. **Monitor database connections** for unusual activity

## Troubleshooting

### Build Failures
```bash
# Check if all dependencies are installed
npm install

# Verify environment variables are set
npm run build
```

### Database Connection Issues
```bash
# Test database connection
npm run prisma:studio

# Check migration status
npx prisma migrate status
```

### Environment Issues
- Verify environment indicator shows correct environment
- Check `/api/environment` endpoint for environment status
- Ensure NODE_ENV is set to 'production'

## Monitoring Production

### Health Checks
- **Environment Status:** `/api/environment`
- **Database:** Prisma Studio or Supabase dashboard
- **Application:** Standard Next.js monitoring

### Performance
- Monitor database query performance in Supabase dashboard
- Track application performance with your deployment platform's analytics
- Set up alerts for downtime or errors

## Support

For deployment issues:
1. Check this documentation
2. Verify environment configuration
3. Test locally with production environment variables
4. Check deployment platform logs
5. Review database connection and migrations