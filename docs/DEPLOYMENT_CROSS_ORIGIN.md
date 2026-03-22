# Cross-Origin Deployment (.dev domains)

> **Note**: This guide has been consolidated into [deployment.md](deployment.md). Please use that file for the most up-to-date deployment instructions.

Use this guide for **testing on Cloudflare's default domains** (`.workers.dev` and `.pages.dev`) before you have a custom domain.

## Architecture Limitations
*   **CORS Required:** Browsers will perform pre-flight OPTIONS requests.
*   **Cookie Complexity:** Authentication cookies must be configured for cross-origin domains.
*   **Performance:** Slightly slower due to separate origin handshakes.

---

## Step 1: Deploy the Server (API)
1.  **Initialize the production D1 DB:**
    ```bash
    cd apps/server
    bunx wrangler d1 create your-school-db
    bun run db:migrate:remote
    ```
2.  **Deploy the Worker:**
    ```bash
    cd apps/server
    bun run deploy
    ```
3.  **Copy the Worker URL:** E.g., `https://server.yourname.workers.dev`.

## Step 2: Deploy the Dashboard (Frontend)
1.  **Create a Pages Project:** In the [Cloudflare Dashboard](https://dash.cloudflare.com/), go to **Workers & Pages** > **Create** > **Pages** > **Connect to Git**.
2.  **Configure Build Settings:**
    *   **Framework preset:** `Vite`
    *   **Build command:** `bun run build` (or `npm run build`)
    *   **Root directory:** `apps/dashboard`
3.  **Add Environment Variables:** In the project settings (under **Production** environment), add:
    *   `VITE_API_URL` = `https://server.yourname.workers.dev/api`
    *   `VITE_SITE_URL` = `https://server.yourname.workers.dev`
4.  **Deploy:** Save and deploy. Copy your Pages URL (e.g., `https://cf-dashboard.pages.dev`).

## Step 3: Configure CORS (Crucial)
Because these are separate origins, the browser will block the dashboard unless you explicitly allow it:

1.  Navigate to **Workers & Pages** > **server (the worker)** in the Cloudflare Dashboard.
2.  Go to **Settings** > **Variables**.
3.  Add/Edit `FRONTEND_URL` = `https://cf-dashboard.pages.dev` (the URL from Step 2).
4.  **Save and Deploy.**

---

## Troubleshooting
*   **Mixed Content:** Always use `https://` for both URLs.
*   **CORS Errors:** Check the `FRONTEND_URL` variable in your Worker settings matches your Pages URL exactly (including the protocol).
*   **Cookie Issues:** Since the apps are on different domains (`.pages.dev` and `.workers.dev`), authentication cookies **must** be configured with `SameSite=None` and `Secure`. Ensure your `apps/server/src/routes/auth.ts` has `sameSite: 'None'`.
