# Unified Same Domain Deployment (Recommended for Production)

> **Note**: This guide has been consolidated into [deployment.md](deployment.md). Please use that file for the most up-to-date deployment instructions.

This architecture uses Cloudflare's platform to serve both your **Dashboard (Pages)** and **Server (Workers)** on a single domain (e.g., `app.yourdomain.com`).

## Architecture Benefits
*   **No CORS:** Browsers treat this as "Same-Origin."
*   **Faster:** Eliminates "Pre-flight" (OPTIONS) requests.
*   **Secure:** Allows `HttpOnly` and `SameSite=Strict` cookies for authentication.

---

## Step 1: Initialize the Remote Database
1.  **Create the production D1 DB:**
    ```bash
    cd apps/server
    bunx wrangler d1 create your-school-db
    ```
2.  **Apply Migrations:**
    ```bash
    bun run db:migrate:remote
    ```

## Step 2: Deploy the Server (Worker)
1.  **Deploy the Worker:**
    ```bash
    cd apps/server
    bun run deploy
    ```
2.  **Note the URL:** It will look like `https://server.yourname.workers.dev`.

## Step 3: Deploy the Dashboard (Pages)
1.  **Create a Pages Project:** In the [Cloudflare Dashboard](https://dash.cloudflare.com/), go to **Workers & Pages** > **Create** > **Pages** > **Connect to Git**.
2.  **Configure Build Settings:**
    *   **Framework preset:** `Vite`
    *   **Build command:** `bun run build`
    *   **Root directory:** `apps/dashboard`
3.  **Add Environment Variables:** In project settings (under **Production** environment), add:
    *   `VITE_API_URL` = `/api`
    *   `VITE_SITE_URL` = `https://app.yourdomain.com`
4.  **Deploy:** Save and deploy.

## Step 4: Configure the Unified Domain
Performed in the [Cloudflare Dashboard](https://dash.cloudflare.com/):

1.  **Add Custom Domain to Pages:**
    *   **Workers & Pages** > **cf-dashboard** > **Custom Domains**.
    *   Add your domain (e.g., `app.yourdomain.com`).
2.  **Route the API via Custom Domain:**
    *   **Workers & Pages** > **server (worker)** > **Settings** > **Triggers**.
    *   Under **Routes**, click **Add Route**.
    *   **Route:** `app.yourdomain.com/api/*`
    *   **Zone:** Select your domain.
3.  **Update Server Variables:**
    *   In Worker settings, set `FRONTEND_URL` = `https://app.yourdomain.com`.

---

## Troubleshooting
*   **Cookie Issues:** In unified mode, `SameSite=Strict` or `SameSite=Lax` works best. However, `SameSite=None` (used for cross-origin testing) remains compatible if `Secure: true` is set.
