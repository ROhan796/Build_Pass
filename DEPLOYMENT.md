# Deployment Guide — HH Goa 2026

Step-by-step deployment for the React frontend (Vercel) and FastAPI backend (Render).

---

## Architecture

```
┌──────────────────┐         ┌──────────────────┐
│                  │  HTTPS  │                  │
│  Vercel          │────────▶│  Render          │
│  (React SPA)     │         │  (FastAPI)       │
│                  │         │                  │
└──────────────────┘         └────────┬─────────┘
                                      │
                             ┌────────▼─────────┐
                             │   NeonDB         │
                             │   (PostgreSQL)   │
                             └──────────────────┘
```

- **Frontend**: Vite + React, deployed on Vercel as a static SPA
- **Backend**: FastAPI + Python, deployed on Render as a Docker container
- **Database**: NeonDB (serverless PostgreSQL)
- **File storage**: Local `uploads/` folder on Render (no R2)

---

## Prerequisites

- GitHub account with the repo pushed
- [Vercel account](https://vercel.com) (free tier works)
- [Render account](https://render.com) (free tier works)
- [NeonDB account](https://neon.tech) (free tier works)
- [Clerk account](https://clerk.com) (free tier works)

---

## Step 1 — Deploy Backend on Render

### 1.1 Create a Render service

1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click **New +** → **Web Service**
3. Connect your GitHub repo
4. Fill in:
   - **Name**: `hh-backend`
   - **Runtime**: Docker
   - **Dockerfile path**: `./HH-backend/Dockerfile`
   - **Docker context**: `./HH-backend`
   - **Port**: `8000`
   - **Health Check Path**: `/health`

### 1.2 Set environment variables

In the Render dashboard, go to **Environment** tab and add:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `postgresql+asyncpg://...` | Your NeonDB connection string |
| `CLERK_SECRET_KEY` | `sk_live_...` | From Clerk dashboard |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Set after Vercel deploy, or use `*` initially |
| `LOCAL_UPLOAD_DIR` | `./uploads` | Default upload directory |

### 1.3 Deploy

Click **Create Web Service**. Render will:
1. Pull your repo
2. Build the Docker image (`pip install`, font install, copy files)
3. Run `uvicorn main:app --host 0.0.0.0 --port 8000`

Your backend will be live at `https://hh-backend.onrender.com`.

### 1.4 Verify

Visit `https://hh-backend.onrender.com/health` — should return `{"status": "healthy"}`.

---

## Step 2 — Deploy Frontend on Vercel

### 2.1 Import project

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repo
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./HH-frontend` (if deploying from root, or just the repo if deploying the frontend subfolder)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.2 Set environment variables

In the Vercel project settings → **Environment Variables**, add:

| Key | Value | Environments |
|-----|-------|-------------|
| `VITE_API_URL` | `https://hh-backend.onrender.com` | Production, Preview, Development |
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_live_...` | Production, Preview, Development |

### 2.3 Deploy

Click **Deploy**. Vercel will:
1. Install dependencies (`npm install`)
2. Run `vite build` → outputs to `dist/`
3. Deploy the `dist/` folder as a static site

Your frontend will be live at `https://your-app.vercel.app`.

### 2.4 SPA routing (already configured)

The `vercel.json` in `HH-frontend/` handles SPA routing:

```json
{
  "rewrites": [
    { "source": "/((?!assets/|.*\\..*).*)", "destination": "/index.html" }
  ]
}
```

This means:
- `/create` → serves `index.html` → React Router handles it
- `/result` → serves `index.html` → React Router handles it
- `/admin` → serves `index.html` → React Router handles it
- `/assets/chunk-abc.js` → serves the actual file (static assets)
- `/unknown-path` → serves `index.html` → React Router shows catch-all redirect to `/`

---

## Step 3 — Update CORS on Backend

After you get your Vercel URL, update the `FRONTEND_URL` env var on Render:

1. Go to Render dashboard → your `hh-backend` service → **Environment**
2. Update `FRONTEND_URL` to `https://your-app.vercel.app`
3. Save — Render will auto-redeploy

This allows the backend to accept requests from your Vercel frontend.

---

## Step 4 — Update Clerk Origins

1. Go to [Clerk dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Paths** or **Domains**
4. Add your Vercel URL: `https://your-app.vercel.app`

This allows Clerk auth to work from your deployed frontend.

---

## Step 5 — Update Share URLs (if applicable)

If you have share/OG image links hardcoded anywhere:

1. Update the domain in `src/lib/api.ts` if needed (it uses `VITE_API_URL` already)
2. Update any hardcoded `hhgoa.app` URLs in share templates or meta tags

---

## Environment Variables Reference

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://hh-backend.onrender.com` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk public key for auth | `pk_live_xxx` |

### Backend (Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | NeonDB PostgreSQL connection string | `postgresql+asyncpg://user:pass@ep-xxx.neon.tech/db?ssl=require` |
| `CLERK_SECRET_KEY` | Clerk secret key for JWT verification | `sk_live_xxx` |
| `FRONTEND_URL` | Allowed CORS origin (your Vercel URL) | `https://your-app.vercel.app` |
| `LOCAL_UPLOAD_DIR` | Where generated images are saved | `./uploads` |

---

## File Upload Storage

You are using local filesystem storage (`./uploads` folder on Render), not Cloudflare R2.

**Tradeoffs:**
- Works fine for low-traffic apps
- Files are lost on Render service restarts (free tier sleeps after 15 min inactivity)
- No CDN for images — they're served directly from Render

**If you need persistence later**, switch to R2 or Vercel Blob by setting `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET`, and `R2_PUBLIC_URL` in the backend env vars.

---

## Post-Deployment Checklist

- [ ] Backend `/health` endpoint returns `{"status": "healthy"}`
- [ ] Frontend loads at Vercel URL
- [ ] Frontend can reach backend API (check browser console for CORS errors)
- [ ] Sign-in / sign-up works (Clerk)
- [ ] Upload a photo → generate a card works end-to-end
- [ ] Download generated image works
- [ ] Share link works (OG meta tags render correctly)
- [ ] Admin dashboard loads and shows stats

---

## Common Issues

### CORS errors in browser console

Backend `FRONTEND_URL` doesn't match your Vercel URL. Update it in Render dashboard.

### "Failed to fetch" on API calls

- Check `VITE_API_URL` is set correctly in Vercel
- Check Render service is not sleeping (free tier). Visit the `/health` endpoint to wake it
- Verify the backend deployed successfully in Render logs

### Images not loading after generation

The `uploads/` folder is ephemeral on Render free tier. Images are lost on redeploy. Consider R2 for persistence.

### SPA routes return 404 on Vercel

Make sure `vercel.json` exists in `HH-frontend/` with the rewrite rule (already created).

### Clerk auth breaks in production

Add your Vercel domain to Clerk's allowed origins in the Clerk dashboard.

---

## Deployment Order

```
1. Deploy Backend (Render)
   └─ Set DATABASE_URL, CLERK_SECRET_KEY, LOCAL_UPLOAD_DIR

2. Verify backend health
   └─ GET https://hh-backend.onrender.com/health

3. Deploy Frontend (Vercel)
   └─ Set VITE_API_URL, VITE_CLERK_PUBLISHABLE_KEY

4. Update backend FRONTEND_URL
   └─ Set to Vercel URL, trigger redeploy

5. Update Clerk origins
   └─ Add Vercel URL

6. Test end-to-end
   └─ Upload → Generate → Download → Share
```

---

## Updating After Initial Deploy

**Frontend changes** — Push to GitHub. Vercel auto-deploys on every push to `main`.

**Backend changes** — Push to GitHub. Render auto-deploys on every push to `main`.

**Environment variable changes** — Update in Vercel/Render dashboard. Vercel requires a redeploy. Render auto-redeploys on env var save.

---

*For questions or issues, check the logs in Vercel/Render dashboards first.*
