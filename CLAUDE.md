# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linting
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:studio` - Open Prisma Studio database browser

## Architecture Overview

This is a Next.js 15 application for managing tree/farm data called "สวนวิสุทธิ์ศิริ" (Visutthisiri Garden). The app uses:

- **Database**: Supabase (PostgreSQL) for data storage
- **ORM**: Prisma with type-safe repository pattern
- **UI**: Tailwind CSS for styling with shadcn/ui components
- **Charts**: Chart.js with react-chartjs-2 for data visualization
- **State**: React hooks for client-side state management
- **Notifications**: react-hot-toast for user feedback
- **Validation**: Zod schemas for data validation

### Key Database Tables

The application manages several types of data:
- `trees` - Individual tree records with location_id, tree_number, variety
- `tree_logs` - Individual tree maintenance logs (fertilizer, health, images)
- `batch_logs` - Plot-level maintenance activities
- `tree_costs` - Cost tracking for activities
- `activities` - Reference data for activity types

### Application Structure

**Main Features:**
1. **Logs Management** (`/logs`) - Track tree maintenance activities
   - Single tree logs with health status, fertilizer, images
   - Batch logs for entire plots
   - Cost tracking for activities
2. **Gallery** (`/gallery`) - View uploaded images from tree logs
3. **Reports** (`/report`) - Data visualization and analytics
4. **Admin** (`/admin`) - System management

**Data Flow Pattern:**
- Components use Supabase client for direct database access
- Client-side data fetching with pagination (PAGE_SIZE = 5)
- Tree lookup uses client-side mapping for performance
- Image uploads handled through Supabase storage

### Component Organization

- `/components/` contains reusable sections (BatchLogSection, SingleLogSection, CostLogSection)
- Each section handles its own pagination and data display
- Components expect specific data types and handle loading states

### Configuration

- Supabase credentials configured via environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_KEY`
- Image domains configured in next.config.ts for Supabase storage
- TypeScript path mapping: `@/*` maps to root directory

### Development Notes

- The app is entirely in Thai language
- Uses emoji icons throughout the UI
- Client-side rendering with "use client" directive
- Responsive design with Tailwind CSS grid system

### Recent Enhancements (December 2024)

**Authentication & Security:**
- Complete Supabase Auth integration with email/password authentication
- Role-based access control (admin vs farm-worker)
- Protected routes with automatic redirection
- User session management with React Context

**UI/UX Improvements:**
- shadcn/ui component library integration
- Modern Card, Button, Input, and Form components
- Consistent design system with accessible components
- Mobile-responsive navigation and layouts

**Enhanced Features:**
- Search and filtering functionality in admin sections
- CSV export capabilities for all data types
- Bulk data export with individual and combined options
- Improved TypeScript type safety
- Real-time toast notifications

**Technical Architecture:**
- Centralized Supabase client configuration (`/lib/supabase.ts`)
- Authentication context provider (`/contexts/AuthContext.tsx`)
- Protected route components with role checking
- CSV utility functions for data export/import
- Proper error handling and loading states

**New Authentication Flow:**
1. Users must authenticate at `/auth` page
2. Role-based access controls admin features
3. Session persistence across browser refreshes
4. Secure logout functionality

**Enhanced Admin Panel:**
- Modern card-based layout with shadcn/ui
- Search functionality when items > 5
- Individual CSV export per section
- Bulk export all data functionality
- Improved data type safety

## Prisma ORM Implementation (December 2024)

**Modern Database Layer:**
- Complete Prisma ORM setup with PostgreSQL
- Auto-generated TypeScript types for all database models
- Repository pattern for consistent data access
- Zod validation schemas for data integrity
- Type-safe CRUD operations across the application

**Key Features:**
- `/admin-prisma` - Modern admin interface using Prisma repositories
- Type-safe database operations with IntelliSense support
- Centralized validation and error handling
- Migration management for schema changes
- Performance optimized queries with Prisma

**Database Models:**
- `Tree` - Individual tree records with full type safety
- `TreeLog` - Activity logs with proper relationships
- `BatchLog` - Plot-level operations
- `TreeCost` - Cost tracking with validation
- Reference data models (`Variety`, `Fertilizer`, etc.) with CRUD operations

**Developer Benefits:**
- Adding new data types is now streamlined with auto-generated types
- Consistent API patterns across all database operations
- Built-in validation prevents data integrity issues
- IntelliSense support for all database operations
- Easy migration management for schema changes

**Setup:** See `docs/DATABASE-SETUP-INSTRUCTIONS.md` for complete setup instructions.