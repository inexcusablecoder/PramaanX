# PramaanX Production Deployment Guide (Option 1: Vercel + Render + Neon)

This guide walks you through deploying **PramaanX** to production using:
- **Neon.tech**: Serverless Cloud PostgreSQL
- **Render.com**: Backend Node.js API Web Service
- **Vercel.com**: High-Performance Global CDN for the React Frontend

---

## Prerequisites
- A GitHub account with access to [`https://github.com/inexcusablecoder/PramaanX`](https://github.com/inexcusablecoder/PramaanX)
- A free account on [Neon.tech](https://neon.tech)
- A free account on [Render.com](https://render.com)
- A free account on [Vercel.com](https://vercel.com)

---

## Step 1: Create Your PostgreSQL Database on Neon

1. Sign up / log in to [Neon.tech](https://neon.tech).
2. Click **Create Project**.
   - **Name**: `pramaanx-db`
   - **Region**: Choose the closest region (e.g. `Asia Pacific (Singapore)` or `US East (N. Virginia)`).
3. Once created, copy the **Connection string**:
   ```
   postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
   ```
4. **Push Schema (Optional from Local Machine)**:
   In your local terminal:
   ```powershell
   # Add your connection string to .env:
   # DATABASE_URL=postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
   pnpm --filter @workspace/db run push
   ```
   *(Note: The backend automatically initializes and runs migrations on first boot even if you skip this step!)*

---

## Step 2: Deploy Backend to Render

### Method A: One-Click Blueprint (Recommended)
1. Log in to [Render.com](https://render.com).
2. Click **New +** &rarr; **Blueprint**.
3. Connect your GitHub repository `inexcusablecoder/PramaanX`.
4. Render will automatically detect [`render.yaml`](file:///c:/Users/Lenovo/OneDrive/Desktop/PramaanX/render.yaml).
5. Paste your `DATABASE_URL` from Step 1 into the prompt.
6. Click **Apply**.

### Method B: Manual Web Service Setup
1. Click **New +** &rarr; **Web Service**.
2. Connect `inexcusablecoder/PramaanX`.
3. Configure the following fields:
   - **Name**: `pramaanx-api`
   - **Language**: `Node`
   - **Branch**: `main`
   - **Root Directory**: *(Leave blank)*
   - **Build Command**:
     ```bash
     corepack enable && pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build
     ```
   - **Start Command**:
     ```bash
     node artifacts/api-server/dist/index.mjs
     ```
   - **Plan**: Free
4. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `DATABASE_URL` = *(Your Neon PostgreSQL connection string)*
5. Click **Create Web Service**.
6. Wait 2-3 minutes for the build to finish. Once live, copy your backend URL, for example:
   ```
   https://pramaanx-api.onrender.com
   ```

---

## Step 3: Connect Frontend and Deploy to Vercel

1. In your local repository, open [`vercel.json`](file:///c:/Users/Lenovo/OneDrive/Desktop/PramaanX/vercel.json).
2. Replace `https://pramaanx-api.onrender.com` with your **actual Render URL** from Step 2:
   ```json
   {
     "source": "/api/:match*",
     "destination": "https://YOUR-ACTUAL-RENDER-URL.onrender.com/api/:match*"
   }
   ```
3. Commit and push the updated `vercel.json` to GitHub:
   ```powershell
   git add vercel.json
   git commit -m "chore: Set production Render backend URL in vercel.json"
   git push origin main
   ```
4. Now, go to [Vercel.com](https://vercel.com) and click **Add New** &rarr; **Project**.
5. Import `inexcusablecoder/PramaanX`.
6. Vercel automatically detects `vercel.json`. The pre-configured settings are:
   - **Framework Preset**: `Vite`
   - **Build Command**: `pnpm --filter @workspace/pramaanx run build`
   - **Output Directory**: `artifacts/pramaanx/dist/public`
7. Click **Deploy**.
8. In ~45 seconds, your application will be deployed live at `https://pramaanx.vercel.app`!

---

## Step 4: Verification & Live Health Check

1. **Test API**:
   Open `https://YOUR-RENDER-URL.onrender.com/api/healthz` in your browser.
   It should return:
   ```json
   { "status": "ok" }
   ```

2. **Test Frontend & Routing**:
   Open your live Vercel URL (e.g. `https://pramaanx.vercel.app`).
   - Navigate to **Assets** (`/assets`): The interactive Leaflet map with Tactical Dark, Streets, and Satellite layers should load smoothly.
   - Navigate to **Workforce** (`/workforce`): The active personnel registry and KYC verification queue should load.
   - Refresh the page while on `/assets` or `/workforce` to verify that SPA routing works without 404s.

3. **Test GPS Live Simulation & Activity Log**:
   - In the `/assets` tab, click any machinery or vehicle and click **"Simulate Satellite Ping"**.
   - Navigate to `/activity` to confirm the audit trail has recorded the event.
