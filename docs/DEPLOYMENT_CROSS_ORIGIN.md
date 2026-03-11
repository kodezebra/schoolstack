# Cross-Origin Deployment (.dev domains)

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
    bunx wrangler d1 create kz-db
    bun run db:migrate:remote
    ```
2.  **Deploy the Worker:**
    ```bash
    cd apps/server
    bun run deploy
    ```
3.  **Copy the Worker URL:** E.g., `https://server.yourname.workers.dev`.

## Step 2: Deploy the Dashboard (Frontend)
1.  **Build using the Worker's URL:**
    ```bash
    cd apps/dashboard
    # VITE_API_URL: Your worker's API URL
    # VITE_SITE_URL: Your worker's base URL (where it serves SSR)
    VITE_API_URL=https://server.yourname.workers.dev/api VITE_SITE_URL=https://server.yourname.workers.dev bun run build
    bun run deploy
    ```
2.  **Copy the Pages URL:** E.g., `https://cf-dashboard.pages.dev`.

## Step 3: Configure CORS (Crucial)
Because these are separate origins, the browser will block the dashboard unless you explicitly allow it:

1.  Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2.  Navigate to **Workers & Pages** > **server (the worker)**.
3.  Go to **Settings** > **Variables**.
4.  Add/Edit `FRONTEND_URL` = `https://cf-dashboard.pages.dev`.
5.  **Save and Deploy.**

---

## Troubleshooting
*   **Mixed Content:** Always use `https://` for both URLs.
*   **CORS Errors:** Check the `FRONTEND_URL` variable in your Worker settings matches your Pages URL exactly (including the protocol).
*   **Cookie Issues:** If using cookies for auth, ensure the server's `cors` middleware includes `credentials: true`.
