# Unified Same Domain Deployment (Recommended for Production)

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
    bunx wrangler d1 create kz-db
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
1.  **Build and Deploy:**
    ```bash
    cd apps/dashboard
    # VITE_API_URL: The relative path to your worker API
    # VITE_SITE_URL: The public URL of your site (where the worker serves SSR)
    VITE_API_URL=/api VITE_SITE_URL=https://app.yourdomain.com bun run build
    bun run deploy
    ```
2.  **Follow the Prompts:** Create a new Pages project named `cf-dashboard`.

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

## Unified Command
Once set up, use the root command to deploy updates to both apps:
```bash
bun run deploy
```
