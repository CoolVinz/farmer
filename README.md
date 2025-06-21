# สวนวิสุทธิ์ศิริ - Durian Farm Management System

A Next.js application for managing durian farm data with yield tracking, maintenance logs, image storage, and analytics.

## 🚀 Quick Start

### Development Setup
```bash
# Install dependencies
npm install

# Set up database
npm run prisma:migrate
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📊 Features

- **Durian Tree Management** - Track individual durian trees with locations and varieties
- **Maintenance Logs** - Record fertilizer, health status, and care activities
- **Yield Tracking** - Monitor durian production with time-period analytics (kg-based)
- **Cost Management** - Track expenses for farming activities
- **Image Storage** - Upload and manage tree photos with Supabase Storage
- **Gallery** - View uploaded images from maintenance logs
- **Reports & Analytics** - Data visualization with Chart.js

## 🛠️ Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run code linting
- `npm run prisma:studio` - Open database browser
- `npm run prisma:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data
- `npm run pre-push` - Quality check before git push

## 🏗️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase PostgreSQL with Prisma ORM
- **Storage**: Supabase Storage for image uploads
- **UI**: Tailwind CSS + shadcn/ui components
- **Charts**: Chart.js with react-chartjs-2
- **Forms**: react-hook-form with Zod validation
- **Language**: TypeScript + Thai language interface

## 📁 Project Structure

```
app/
├── trees/          # Tree management pages
├── logs/           # Maintenance logging
├── gallery/        # Image gallery
├── reports/        # Analytics and reports
├── admin/          # Administration
└── api/            # API routes

components/
├── ui/             # shadcn/ui components
├── gallery/        # Gallery-specific components
└── *.tsx           # Feature components

lib/
├── repositories/   # Database access layer
├── utils/          # Utility functions
└── validations.ts  # Zod schemas
```

## 🎯 Key Features

### Durian Yield Tracking System
- Real-time yield updates with +/- buttons for durian count
- Interactive Chart.js visualizations showing kg production
- Time-period analysis (7d, 30d, 90d, 1yr, all)
- Smart yield change parsing from log notes
- Statistical analytics with trend tracking
- Variety-specific weight calculations (หมอนทอง: 2.5kg, ชะนี: 3.0kg, etc.)

### Repository Pattern
- Type-safe database operations with Prisma
- Centralized data access in `/lib/repositories/`
- Zod validation for all inputs
- Consistent error handling

### UI/UX
- Fully responsive design
- Thai language throughout
- Emoji icons for better UX
- Toast notifications for user feedback
- Loading states and error boundaries

## 🔧 Development Workflow

```bash
# Daily development
npm run dev

# Before committing
npm run pre-push
git add .
git commit -m "Your changes"
git push
```

## 📚 Database Schema

Key entities:
- **Trees** - Individual tree records with varieties and locations
- **Tree Logs** - Maintenance activities and health tracking
- **Batch Logs** - Plot-level operations
- **Tree Costs** - Cost tracking for activities
- **Sections & Plots** - Hierarchical farm organization

## 🌱 Seeding Data

The database includes test data:
- 30 durian trees across 3 sections
- Durian varieties: หมอนทอง, ชะนี, กันยาว, กระดุม, ไผ่ทอง
- Sample yield tracking logs with durian weight calculations
- Reference data (fertilizers, pesticides, activities)
- Cost tracking examples

Reset database: `npm run prisma:reset && npm run db:seed`

## 📝 Notes

- Application is entirely in Thai language
- Uses emoji icons throughout the interface
- Client-side pagination (8 items per page)
- Context-aware navigation with URL parameters
- Mobile-responsive design

---

Built with Next.js 15 + TypeScript + Prisma + Tailwind CSS