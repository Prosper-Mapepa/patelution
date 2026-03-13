# Deploying Patelution Frontend on Netlify

This app is configured to deploy on [Netlify](https://www.netlify.com). Build settings are in `netlify.toml`.

## 1. Connect the repo

- Log in at [app.netlify.com](https://app.netlify.com).
- **Add new site** → **Import an existing project** → choose your Git provider and repo.
- If the repo root contains both `web` and `backend`, set **Base directory** to `web` so Netlify builds the frontend only.
- Netlify will use the build command and publish directory from `netlify.toml` (or you can leave defaults).

## 2. Environment variables

In **Site settings** → **Environment variables** → **Add a variable** (or **Add from file**):

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | **Yes** (for production) | Full URL of your backend API (e.g. Railway). Example: `https://your-backend.up.railway.app`. Do not add a trailing slash. If unset, the app uses `http://localhost:4000` (fine for local dev only). |

Add it for **Production** (and optionally **Deploy previews** if you want previews to hit a real API).

## 3. Build and deploy

- **Build command:** `npm run build` (from `netlify.toml`).
- **Publish directory:** `.next` (from `netlify.toml`; Netlify’s Next.js support may override this).
- **Node version:** 20 (set in `netlify.toml`).

Trigger a deploy (e.g. push to your main branch or click **Deploy site**). After the first successful deploy, your site URL will be something like `https://random-name-123.netlify.app`.

## 4. After deploy

- Open the site URL and confirm the app loads.
- Ensure your **backend** (e.g. on Railway) has `CORS_ORIGIN` set to your Netlify URL (e.g. `https://random-name-123.netlify.app` or your custom domain) so the browser can call the API.

## Optional: custom domain

In **Domain management** you can add a custom domain and, if you use HTTPS, set `NEXT_PUBLIC_API_URL` and backend `CORS_ORIGIN` to that domain.
