# Deployment Guide

Deploy the 3 services separately:
- **Client** (React) → Vercel
- **Server** (Node.js) → Render
- **AI Service** (Python) → Render

---

## Step 1 — Push to GitHub

Make sure your `.env` files are NOT committed (they're in `.gitignore`).

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/foodrescue.git
git push -u origin main
```

---

## Step 2 — Deploy AI Service on Render

1. Go to [render.com](https://render.com) → Sign up / Log in
2. **New** → **Web Service** → Connect your GitHub repo
3. Settings:
   - **Name:** `foodrescue-ai`
   - **Root Directory:** `ai-service`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `GOOGLE_API_KEY` = your Gemini API key
   - `MODEL_PROVIDER` = `gemini`
5. Click **Deploy** — wait for it to go live
6. Copy the URL e.g. `https://foodrescue-ai.onrender.com`
<!-- https://foodrescue-ai.onrender.com
 -->
---

## Step 3 — Deploy Server on Render

1. **New** → **Web Service** → same GitHub repo
2. Settings:
   - **Name:** `foodrescue-server`
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add ALL environment variables from your `server/.env`:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your Atlas URI
   - `JWT_SECRET` = your secret
   - `JWT_REFRESH_SECRET` = your refresh secret
   - `JWT_EXPIRE` = `7d`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `AI_SERVICE_URL` = the URL from Step 2 e.g. `https://foodrescue-ai.onrender.com`
   - `EMAIL_HOST` = `smtp.gmail.com`
   - `EMAIL_PORT` = `587`
   - `EMAIL_USER` = your Gmail
   - `EMAIL_PASS` = your app password
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `CLIENT_URL` = your Vercel URL (fill in after Step 4, then redeploy)
4. Click **Deploy** — copy the URL e.g. `https://foodrescue-server.onrender.com`
<!-- https://foodrescue-server.onrender.com -->
---

## Step 4 — Deploy Client on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up / Log in with GitHub
2. **New Project** → Import your GitHub repo
3. Settings:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variables:
   - `VITE_API_URL` = `https://foodrescue-server.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://foodrescue-server.onrender.com`
   - `VITE_CLOUDINARY_CLOUD_NAME` = your cloud name
   - `VITE_CLOUDINARY_UPLOAD_PRESET` = your upload preset
5. Click **Deploy** — copy the URL e.g. `https://foodrescue.vercel.app`
<!-- https://food-rescue-ai-six.vercel.app/ -->
---

## Step 5 — Update URLs

After all 3 are deployed:

1. Go back to your **Render server** service → Environment → update:
   - `CLIENT_URL` = your Vercel URL

2. Go to **Google Cloud Console** → OAuth credentials → add your Render server URL to Authorized redirect URIs:
   - `https://foodrescue-server.onrender.com/api/auth/google/callback`

3. Redeploy the server on Render (it auto-redeploys on env changes).

---

## Free Tier Notes

- Render free tier **spins down after 15 min of inactivity** — first request after sleep takes ~30s
- To avoid this, upgrade to Render's $7/month plan or use [UptimeRobot](https://uptimerobot.com) to ping your service every 10 minutes (free)
- Vercel free tier is always-on with no cold starts
