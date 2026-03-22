# SchoolStack

A comprehensive school management CMS platform for educational institutions.

> **Start here**: Clone this repo, customize for your school(s), and deploy to Cloudflare in minutes.

## Features

- **Dashboard** - Overview statistics and quick actions
- **School Management** - Students, staff, subjects, academic years, terms, levels
- **Fee Management** - Fee structures, payments, receipts, extra charges
- **Examination System** - Exams, results, grade scales
- **CMS** - Block-based page builder with templates
- **User Management** - Role-based access control (Owner, Admin, Editor, Viewer)
- **Contact Inbox** - Manage contact form submissions

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, TanStack Router, TanStack Query |
| Styling | Tailwind CSS, shadcn/ui, Radix UI |
| Backend | Hono (Cloudflare Workers) |
| Database | Cloudflare D1 (SQLite via Drizzle ORM) |
| Storage | Cloudflare R2 |
| Monorepo | Turborepo, Bun |

## Quick Start

```bash
# Install dependencies
bun install

# Start development servers
bun run dev
```

Dashboard: http://localhost:5173
API: http://localhost:8787

## Customization

### 1. Rename Your Project

Update the following files to use your school/organization name:

```bash
# Update app names in apps/*/package.json
# Update wrangler.jsonc "name" field
# Update dashboard title in layouts
```

### 2. Configure Your Brand

Edit school settings in the dashboard:
- School name and logo
- Primary brand color
- Contact information

### 3. Set Up Database

```bash
cd apps/server

# Create local database
bunx wrangler d1 create your-db-name

# Apply migrations
bun run db:migrate
```

## Project Structure

```
schoolstack/
├── apps/
│   ├── dashboard/          # React frontend (admin CMS)
│   └── server/             # Hono API + SSR (public site)
├── docs/                   # Documentation
├── package.json            # Root workspace
├── turbo.json              # Turborepo config
└── RULES.md                # Coding standards
```

## Available Scripts

```bash
bun run dev      # Start all apps in development mode
bun run build    # Build all apps for production
bun run deploy   # Deploy to Cloudflare
bun run lint     # Lint all apps
bun run format   # Format code with Prettier
```

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/getting-started.md) | Detailed setup, prerequisites, database setup |
| [Architecture](docs/architecture.md) | System architecture, tech decisions, data flow |
| [Deployment](docs/deployment.md) | Deploy to Cloudflare (unified domain) |
| [API Reference](docs/api-reference.md) | API endpoints summary |
| [User Guides](docs/user-guides/) | Role-based documentation for end users |
| [Block System](docs/BLOCK_SYSTEM.md) | CMS page builder documentation |

## Deployment

This app is designed for Cloudflare's platform:

- **Dashboard** → Cloudflare Pages
- **Server (API + SSR)** → Cloudflare Workers
- **Database** → Cloudflare D1
- **Storage** → Cloudflare R2

See [docs/deployment.md](docs/deployment.md) for deployment guides.

## Environment Variables

### Dashboard (apps/dashboard/.env)
```bash
VITE_API_URL=http://localhost:8787/api
VITE_SITE_URL=http://localhost:8787
```

### Server (apps/server/.dev.vars)
```bash
FRONTEND_URL=http://localhost:5173
```

## License

MIT License - Free to use and modify for your school(s).
