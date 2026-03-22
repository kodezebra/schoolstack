# Git-Based Deployment (CI/CD)

> **Note**: This guide has been consolidated into [deployment.md](deployment.md). Please use that file for the most up-to-date deployment instructions.

This is the recommended way to deploy the **Dashboard** for production. Cloudflare will automatically build and deploy your site every time you push to your Git repository.

## Step 1: Connect to Cloudflare Pages
1.  Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2.  Go to **Workers & Pages** > **Create** > **Pages** > **Connect to Git**.
3.  Select your repository.

## Step 2: Build Settings
Use these exact settings to ensure the monorepo builds correctly:

*   **Project Name:** `cf-dashboard` (or your choice)
*   **Production branch:** `main`
*   **Framework preset:** `Vite`
*   **Root directory:** `apps/dashboard`
*   **Build command:** `bun run build`
*   **Build output directory:** `dist`

## Step 3: Environment Variables
You must add these in the Cloudflare UI (**Settings > Environment variables**) for the build to succeed:

1.  **`VITE_API_URL`**: 
    *   Set to `/api` for Unified Domain.
    *   Set to `https://your-worker.workers.dev/api` for Cross-Origin.
2.  **`VITE_SITE_URL`**: 
    *   Set to `https://yourdomain.com` for Unified Domain.
    *   Set to `https://your-worker.workers.dev` for Cross-Origin.

---

## Benefits of this Method
*   **Automatic Previews:** Every Pull Request gets a unique "Preview URL" automatically.
*   **Rollbacks:** You can revert to any previous deployment with one click in the UI.
*   **No Local Config:** You don't need Wrangler or API keys on your local machine to deploy.
