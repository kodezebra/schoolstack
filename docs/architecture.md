# Architecture

This document describes the system architecture of SchoolStack.

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cloudflare                               │
│                                                                  │
│  ┌─────────────────────┐          ┌─────────────────────────┐ │
│  │      Pages          │          │        Workers          │ │
│  │   (Dashboard)       │          │    (API + SSR Site)     │ │
│  │                     │   CORS   │                         │ │
│  │  React 19 + Vite    │◄────────►│   Hono + Drizzle        │ │
│  │  TanStack Router    │          │                         │ │
│  │  shadcn/ui          │          │                         │ │
│  └─────────────────────┘          └────────────┬────────────┘ │
│                                                │               │
│                   ┌────────────────────────────┼───────────┐   │
│                   │                            │           │   │
│                   ▼                            ▼           ▼   │
│            ┌──────────┐              ┌─────────────┐  ┌────────┐│
│            │   R2     │              │     D1     │  │ KV     ││
│            │ (Files)  │              │ (Database) │  │(Cache) ││
│            └──────────┘              └─────────────┘  └────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture (Dashboard)

### Stack

- **React 19** - UI library with concurrent features
- **TypeScript** - Type safety throughout
- **Vite** - Build tool and dev server
- **TanStack Router** - File-based routing with type safety
- **TanStack Query** - Server state management, caching, mutations
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Accessible, customizable components

### Key Patterns

#### Route Structure

```
src/routes/
├── __root.tsx              # Root layout (providers, global styles)
├── _auth/                  # Auth layout group (public routes)
│   └── login.tsx
├── _dashboard/             # Dashboard layout group (protected)
│   ├── _layout.tsx         # Dashboard shell (sidebar, header)
│   ├── index.tsx           # Dashboard home
│   ├── users.tsx           # User management
│   └── school/             # School module
│       ├── students/
│       ├── staff/
│       └── fees.tsx
└── public/                 # Public site (if SSR'd)
```

#### Data Fetching

All API calls use TanStack Query:

```typescript
// Query - for fetching data
const { data, isLoading } = useQuery({
  queryKey: ['students'],
  queryFn: async () => {
    const res = await apiFetch('/school/students')
    return res.json()
  }
})

// Mutation - for creating/updating
const mutation = useMutation({
  mutationFn: async (data) => {
    return apiFetch('/school/students', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['students'] })
  }
})
```

#### API Client

The `apiFetch` wrapper handles:
- Base URL configuration
- Authentication cookie injection
- JSON serialization
- Error handling

## Backend Architecture (Server)

### Stack

- **Hono** - Lightweight web framework (Cloudflare Workers compatible)
- **Drizzle ORM** - Type-safe database access
- **Zod** - Runtime validation
- **Cloudflare Workers** - Serverless execution environment

### Route Organization

```
src/routes/
├── auth/                   # Authentication endpoints
│   └── index.ts            # /api/auth/*
├── users/                  # User management
│   └── index.ts            # /api/users/*
├── school/                 # School management
│   ├── students.ts         # /api/school/students/*
│   ├── staff.ts            # /api/school/staff/*
│   ├── fees.ts             # /api/school/fees/*
│   ├── exams.ts            # /api/school/exams/*
│   └── index.ts            # Aggregates all school routes
├── pages/                  # CMS pages
├── contact/                # Contact submissions
├── assets/                 # File uploads
└── index.ts                # Main router, aggregates all routes
```

### Request Flow

```
HTTP Request
     │
     ▼
┌─────────────────┐
│   Middleware    │ ──── Auth validation
│                 │ ──── Role checking
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Route Handler  │ ──── Zod validation
│                 │ ──── Business logic
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Database     │ ──── Drizzle queries
│    (D1)         │
└─────────────────┘
         │
         ▼
    JSON Response
```

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts with roles |
| `sessions` | Session management |
| `site_settings` | Site branding and configuration |

### CMS Tables

| Table | Purpose |
|-------|---------|
| `pages` | Page metadata (slug, status, type) |
| `blocks` | Block content (JSON per block) |

### School Tables

| Table | Purpose |
|-------|---------|
| `academic_years` | School years |
| `terms` | Terms within years |
| `levels` | Grade levels (Nursery, P1-S6) |
| `students` | Student records |
| `staff` | Staff records |
| `subjects` | Subject definitions |
| `level_subjects` | Subject-level assignments |
| `fee_structures` | Fee definitions |
| `fee_payments` | Payment records |
| `student_fees` | Extra fees per student |
| `exams` | Exam definitions |
| `exam_results` | Student exam marks |
| `grade_scales` | Grading scales |

### Entity Relationships

```
academic_years ──< terms
levels ──< level_subjects >── subjects
levels ──< students
levels ──< fee_structures
students ──< fee_payments
students ──< exam_results
students ──< student_fees
terms ──< fee_structures
terms ──< exams
exams ──< exam_results
```

## Authentication Flow

### Login

```
1. POST /api/auth/login { email, password }
2. Server validates credentials
3. Server creates session in DB
4. Server returns HTTP-only cookie
5. Client stores cookie, user context updated
```

### Protected Routes

```
1. Request to protected endpoint
2. Middleware extracts session cookie
3. Middleware validates session in DB
4. Middleware attaches user to context
5. Route handler checks role permissions
6. Handler executes or returns 401/403
```

### Session Configuration

- **Storage**: HTTP-only cookie (prevents XSS)
- **Duration**: 30 days
- **SameSite**: Strict (unified domain) / None (cross-origin)

## File Storage

### R2 Bucket Structure

```
your-school-assets/
├── photos/
│   ├── students/{id}.jpg
│   └── staff/{id}.jpg
└── uploads/
    └── {timestamp}-{filename}
```

### Upload Flow

```
1. Client sends file to /api/assets/upload
2. Server validates file type and size
3. Server uploads to R2 bucket
4. Server stores metadata in DB
5. Server returns asset URL
```

### Photo Optimization

Photos are:
- Limited to 2MB
- Converted to JPEG
- Stored with entity ID as filename
- Served via R2 public URL

## SSR (Server-Side Rendering)

Public pages are rendered on the server for:

1. **SEO** - Search engines index rendered HTML
2. **Performance** - First paint is immediate
3. **Progressive Enhancement** - Works without JavaScript

### Render Flow

```
1. Request to public page (e.g., /about)
2. Worker fetches page data from D1
3. Worker fetches blocks from D1
4. Worker renders JSX to HTML
5. Worker injects CSS styles
6. Worker returns complete HTML page
```

## Deployment Architecture

### Unified Domain (Recommended)

```
                    DNS
                      │
                      ▼
            ┌─────────────────┐
            │  Cloudflare CDN │
            └────────┬────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
    ┌───────────┐        ┌───────────┐
    │  Pages    │        │  Workers  │
    │ (Dashboard)│        │  (API)    │
    │           │        │           │
    │ app.domain│        │ domain    │
    │           │        │ /api/*    │
    └───────────┘        └───────────┘
```

### Route Configuration

| Route | Service |
|-------|---------|
| `https://app.domain.com/*` | Cloudflare Pages |
| `https://app.domain.com/api/*` | Cloudflare Worker |

## Security

### Authentication
- Passwords hashed with SHA-256
- Sessions in HTTP-only cookies
- CSRF protection via SameSite

### Authorization
- Role-based access control (RBAC)
- Middleware validates roles per route
- Frontend hides unauthorized UI

### Data Protection
- Input validation with Zod
- SQL injection prevention via Drizzle ORM
- XSS prevention via React's default escaping

## Performance

### Frontend Optimizations
- Code splitting per route
- Lazy loading components
- Image optimization
- Caching with TanStack Query

### Backend Optimizations
- D1 prepared statements
- R2 CDN caching
- Edge execution (low latency)

### Build Optimizations
- Vite production build
- Tree-shaking unused code
- CSS purging via Tailwind
