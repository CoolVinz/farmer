# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build production version (includes Prisma generation)
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linting
- `npm run prisma:generate` - Generate Prisma client manually
- `npm run prisma:studio` - Open Prisma Studio database browser
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:reset` - Reset database (caution: deletes all data)
- `npm run db:seed` - Seed database with test data
- `npm run pre-push` - Safety check before pushing to GitHub

## Architecture Overview

This is a Next.js 15 application for managing tree/farm data called "สวนวิสุทธิ์ศิริ" (Visutthisiri Garden). The app uses:

- **Database**: PostgreSQL for data storage
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
- Prisma repositories for type-safe database operations
- Client-side data fetching with standardized pagination (PAGE_SIZE = 8)
- Tree lookup uses client-side mapping for performance
- Type-safe API routes with Zod validation

### Component Organization

- `/components/` contains reusable sections (BatchLogSection, SingleLogSection, CostLogSection)
- Each section handles its own pagination and data display
- Components expect specific data types and handle loading states

### Configuration

- Database configured via environment variables:
  - `DATABASE_URL` - PostgreSQL connection string
  - `DIRECT_URL` - Direct database connection for migrations
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

## Yield Tracking System (June 2025)

**Comprehensive Yield Analytics:**
- Real-time yield tracking with time-period analysis (7d, 30d, 90d, 1yr, all)
- Interactive Chart.js visualizations showing yield trends and changes
- Smart yield change parsing from existing log notes using regex patterns
- Comprehensive analytics with increase/decrease patterns and velocity tracking

**Key Components:**
- `YieldManager` - Real-time yield updates with +/- buttons and custom input
- `YieldHistoryChart` - Interactive line chart with color-coded change points
- `YieldAnalytics` - Statistical insights with performance metrics and recommendations
- `lib/utils/yieldCalculations.ts` - Comprehensive yield analysis utilities

**API Features:**
- `/api/trees/[id]/yield` - Time period filtering and analytics calculations
- Support for custom date ranges and predefined periods
- Yield event parsing from tree logs with intelligent pattern recognition
- Analytics calculations (velocity, peak/lowest tracking, trend analysis)

**Integration:**
- Context-aware tree logging with auto-selection from URL parameters
- Enhanced tree detail pages with dedicated "Yield Trends" tab
- Seamless integration with existing logging and tree management systems

## Repository Pattern Architecture

**Centralized Data Access:**
- `/lib/repositories/` - Type-safe repository pattern for all database operations
- Repository classes: `TreeRepository`, `TreeLogRepository`, `SectionRepository`, etc.
- Exported via `/lib/repositories/index.ts` for consistent imports
- Each repository handles its specific domain with proper relationships

**Validation Layer:**
- `/lib/validations.ts` - Zod schemas for all data types with TypeScript inference
- Input validation for create/update operations
- Automatic type safety across API routes and components

**Data Strategy:**
- Prisma repositories for all database operations
- Type safety and performance optimized queries
- Consistent data access patterns across the application

## UI Standards & Patterns

**Pagination Consistency:**
- All list views use 8 items per page for optimal mobile/desktop experience
- Standardized across sections, logs, gallery, and admin interfaces
- Pagination components with consistent navigation controls

**Component Architecture:**
- shadcn/ui components for consistent design system
- Thai language throughout with emoji icons for better UX
- Responsive grid layouts with Tailwind CSS
- Loading states and error handling patterns

**Context-Aware Navigation:**
- URL parameters for pre-selecting data (e.g., `?treeId=123` for auto-selection)
- Deep linking support for specific trees, sections, and time periods
- Breadcrumb navigation for hierarchical data (Plot → Section → Tree)

## Common Development Patterns

**Adding New Features:**
1. Create Zod validation schema in `/lib/validations.ts`
2. Generate TypeScript types from schema
3. Create repository class in `/lib/repositories/`
4. Build API routes in `/app/api/` with proper error handling
5. Create UI components following established patterns

**Data Fetching Pattern:**
```typescript
// Use repositories for all database operations
import { treeRepository } from '@/lib/repositories'
const trees = await treeRepository.findMany({ includeLogs: true })
```

**Form Handling:**
- react-hook-form with Zod resolvers for validation
- Toast notifications for user feedback
- Loading states during submission
- Error handling with specific user messages

**File Upload Pattern:**
- Supabase Storage for image uploads
- Client-side validation (size, type)
- Unique filename generation with timestamps
- Error handling with user-friendly messages

## Hydration & SSR Considerations

The application has specific hydration handling patterns documented in `HYDRATION_FIXES.md`:
- Client-only components for dynamic content that differs between server/client
- `suppressHydrationWarning` for known dynamic content differences
- Hydration state tracking with `isHydrated` flags
- Browser extension compatibility with automatic attribute cleanup

## Important Design Decisions

**Multi-Language Considerations:**
- Entirely in Thai language with consistent terminology
- Emoji icons enhance usability across language barriers
- Date formatting uses Thai locale (`th-TH`)

**Performance Optimizations:**
- Prisma client generation included in build process
- Image optimization through Next.js Image component
- Client-side pagination to reduce server load
- Efficient tree lookup with client-side mapping

**Development Philosophy:**
- Type safety throughout with TypeScript and Prisma
- Consistent error handling patterns
- Progressive enhancement with fallback states
- Accessibility considerations in component design