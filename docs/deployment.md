# Deployment Guide

Deploy SchoolStack to Cloudflare's platform.

## Architecture

| Component | Service | URL Pattern |
|-----------|---------|-------------|
| Dashboard | Cloudflare Pages | `https://app.domain.com/*` |
| API | Cloudflare Workers | `https://app.domain.com/api/*` |
| Database | Cloudflare D1 | - |
| Storage | Cloudflare R2 | `https://assets.domain.com/*` |

## Prerequisites

- Cloudflare account with billing enabled
- Domain name (optional for testing)
- Wrangler CLI: `bun add -D wrangler`

## Option 1: Unified Domain (Recommended)

Serve dashboard and API on the same domain for best performance and security.

### Step 1: Initialize Database

```bash
cd apps/server

# Create production D1 database
bunx wrangler d1 create your-school-db

# Note the database_id from output, add to wrangler.jsonc:
# [[d1_databases]]
# binding = "DB"
# database_name = "your-school-db"
# database_id = "your-database-id"

# Apply migrations
bun run db:migrate:remote
```

### Step 2: Deploy Server (Worker)

```bash
cd apps/server
bun run deploy
```

Note the Worker URL: `https://server.xxx.workers.dev`

### Step 3: Deploy Dashboard (Pages)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Select your repository
4. Configure build settings:

| Setting | Value |
|---------|-------|
| Framework preset | `Vite` |
| Build command | `bun run build` |
| Root directory | `apps/dashboard` |
| Build output directory | `dist` |

5. Add environment variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `/api` |
| `VITE_SITE_URL` | `https://app.yourdomain.com` |

6. Deploy

Note the Pages URL: `https://cf-dashboard.pages.dev`

### Step 4: Configure Custom Domain

In Cloudflare Dashboard:

1. **Add domain to Pages**:
   - Workers & Pages → Your Pages project → **Custom Domains**
   - Add `app.yourdomain.com`

2. **Route API via Worker**:
   - Workers & Pages → Your Worker → **Settings** → **Triggers**
   - Under **Routes**, click **Add Route**
   - Route: `app.yourdomain.com/api/*`
   - Zone: `yourdomain.com`

3. **Set Worker environment variable**:
   - Workers & Pages → Your Worker → **Settings** → **Variables**
   - Add: `FRONTEND_URL` = `https://app.yourdomain.com`

4. Save and deploy Worker changes

### Step 5: Verify

Visit `https://app.yourdomain.com` - dashboard should load
Visit `https://app.yourdomain.com/api/auth/me` - should return JSON

## Option 2: Cross-Origin (Testing)

Use separate `.workers.dev` and `.pages.dev` domains for testing.

### Step 1: Deploy Server

```bash
cd apps/server
bun run deploy
```

Note URL: `https://server.xxx.workers.dev`

### Step 2: Deploy Dashboard

1. Create Pages project as in Option 1
2. Set environment variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://server.xxx.workers.dev/api` |
| `VITE_SITE_URL` | `https://cf-dashboard.pages.dev` |

### Step 3: Configure CORS

In Worker settings, add:
- Variable: `FRONTEND_URL`
- Value: `https://cf-dashboard.pages.dev`

### Step 4: Update Cookie Settings

Since apps are on different origins, edit `apps/server/src/routes/auth.ts`:

```typescript
cookie: {
  httpOnly: true,
  secure: true,
  sameSite: 'None',  // Changed from 'Strict'
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
}
```

## Option 3: Git-Based CI/CD (Automatic Deploys)

Connect GitHub to Cloudflare Pages for automatic deployments on push.

### Setup

1. Connect repository as in Option 1 or 2
2. Set environment variables in Pages dashboard
3. Push to `main` branch to trigger deployment

### Benefits

- Automatic preview deployments for PRs
- One-click rollbacks
- No local deploys needed

## Configuration Reference

### Dashboard Environment Variables

| Variable | Local | Unified Domain | Cross-Origin |
|----------|-------|-----------------|--------------|
| `VITE_API_URL` | `/api` | `/api` | `https://worker.workers.dev/api` |
| `VITE_SITE_URL` | `http://localhost:8787` | `https://yourdomain.com` | `https://pages.pages.dev` |

### Server Environment Variables

| Variable | Description |
|----------|-------------|
| `FRONTEND_URL` | Dashboard URL for CORS |
| `DB` | D1 database binding |
| `ASSETS` | R2 bucket binding |

## Troubleshooting

### CORS Errors

1. Verify `FRONTEND_URL` matches dashboard URL exactly
2. Include protocol (`https://`)
3. No trailing slash

### Cookie Issues

Unified domain: Use `SameSite=Strict`
Cross-origin: Use `SameSite=None` + `Secure=true`

### Database Connection Failed

1. Check `wrangler.jsonc` has correct `database_id`
2. Verify migrations applied: `bun run db:migrate:remote`
3. Check Worker logs in Cloudflare Dashboard

### Build Failed

1. Check environment variables set in Pages settings
2. Verify `VITE_` prefix on dashboard variables
3. Check build logs for specific errors

### Mixed Content Errors

Always use `https://` for all URLs in production.

## R2 Storage Setup

For file uploads:

1. Create R2 bucket: `your-school-assets`
2. Add to `wrangler.jsonc`:

```json
[[r2_buckets]]
binding = "ASSETS"
bucket_name = "your-school-assets"
```

3. Set public URL pattern in site settings
4. Update `FRONTEND_URL` for asset serving

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Dashboard accessible at domain
- [ ] API responding at `/api/*`
- [ ] Login works
- [ ] Photos upload to R2
- [ ] SSL certificate active
- [ ] Performance acceptable
