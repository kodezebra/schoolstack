# Getting Started

This guide walks you through setting up SchoolStack locally for development.

## Prerequisites

- **Bun** 1.3.8+ - Package manager and runtime
- **Node.js** 18+ - Required by some tools
- **Cloudflare account** - For deployment and D1 database
- **Wrangler** - Cloudflare CLI (installed via Bun)

## Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd schoolstack
bun install
```

### 2. Environment Setup

#### Dashboard Environment

Create `apps/dashboard/.env`:

```bash
VITE_API_URL=http://localhost:8787/api
VITE_SITE_URL=http://localhost:8787
```

#### Server Environment

Create `apps/server/.dev.vars`:

```bash
FRONTEND_URL=http://localhost:5173
```

### 3. Local Database Setup

The server uses Cloudflare D1. For local development, you can either:

#### Option A: Use Local D1 Database (Recommended)

```bash
cd apps/server

# Create local database
bun run db:create

# Apply migrations
bun run db:migrate
```

#### Option B: Use SQLite File (Alternative)

Edit `apps/server/src/lib/db.ts` to use a local SQLite file for development:

```typescript
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

const client = createClient({
  url: 'file:local.db',  // Local file instead of D1
})

export const db = drizzle(client)
```

### 4. Start Development Servers

```bash
bun run dev
```

This starts both apps:
- **Dashboard**: http://localhost:5173
- **Server**: http://localhost:8787

## Database Management

### Generate Migrations

After changing the schema in `apps/server/src/db/schema.ts`:

```bash
cd apps/server
bun run db:generate
```

### Apply Migrations

```bash
# Local
bun run db:migrate

# Remote (production)
bun run db:migrate:remote
```

### View Database (Drizzle Studio)

```bash
bun run db:studio
```

## Initial Setup

After starting the servers for the first time:

### 1. Bootstrap the Owner Account

Create your admin account via the API:

```bash
curl -X POST http://localhost:8787/api/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-secure-password",
    "name": "Admin User"
  }'
```

### 2. Access the Dashboard

1. Navigate to http://localhost:5173
2. Log in with your credentials
3. Complete the school setup wizard

## Project Structure

### Dashboard (apps/dashboard)

```
src/
├── components/
│   ├── cms-editor/        # Block-based page editor
│   └── ui/                # shadcn/ui components
├── routes/
│   ├── _auth/             # Authentication routes
│   ├── _dashboard/       # Protected dashboard routes
│   │   ├── cms/           # Page management
│   │   └── school/       # School management
│   └── public/            # Public site routes
├── lib/
│   ├── api.ts             # API client
│   └── hooks/             # Custom React hooks
└── main.tsx               # Entry point
```

### Server (apps/server)

```
src/
├── db/
│   └── schema.ts          # Drizzle ORM schema
├── routes/
│   ├── auth/              # Authentication
│   ├── users/             # User management
│   ├── school/            # School management
│   ├── cms/               # Page/block management
│   └── public/            # SSR public pages
├── lib/
│   ├── db.ts              # Database connection
│   ├── fees.ts            # Fee calculations
│   └── grades.ts          # Grade calculations
└── index.ts               # Hono app entry
```

## Common Tasks

### Adding a New Dashboard Page

1. Create the route file in `apps/dashboard/src/routes/_dashboard/`
2. Use TanStack Router's file-based routing conventions
3. Add shadcn/ui components as needed
4. Use `useQuery`/`useMutation` from TanStack Query for data fetching

### Adding a New API Endpoint

1. Add route handler in `apps/server/src/routes/`
2. Register in `apps/server/src/routes/index.ts`
3. Add schema validation with Zod if needed
4. Update API documentation

### Adding a Database Table

1. Define schema in `apps/server/src/db/schema.ts`
2. Generate migration: `bun run db:generate`
3. Apply migration: `bun run db:migrate`

## Troubleshooting

### "Cannot connect to database"

Ensure Wrangler is logged in:
```bash
wrangler whoami
```

### "CORS error"

Check that `FRONTEND_URL` in server `.dev.vars` matches your dashboard URL exactly (including protocol).

### "Migration failed"

Check that your local D1 database exists and migrations directory is correct.

### "Module not found" errors

```bash
bun install
```

## Next Steps

- [Architecture Overview](architecture.md) - Understand the system design
- [Deployment Guide](deployment.md) - Deploy to production
- [API Reference](api-reference.md) - Explore available endpoints
