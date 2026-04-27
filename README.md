# 🥗 FoodRescue AI

A full-stack platform to reduce food waste — track your inventory, donate surplus food, discover recipes from expiring ingredients, and coordinate NGO pickups with AI-optimized routes.

## Tech Stack

- **Frontend** — React 18, Vite, Zustand, Leaflet maps, Recharts, Framer Motion
- **Backend** — Node.js, Express, MongoDB, Socket.io, Redis
- **AI Service** — Python, FastAPI, Google Gemini (food recognition, recipe generation, route optimization)
- **Infrastructure** — Docker Compose, Cloudinary (images), Nodemailer (email)

## Features

- 📸 AI food scanning — scan food with your camera to auto-fill name, category, and expiry
- 🧠 Smart expiry prediction using Gemini AI
- 🍳 Recipe generation from expiring ingredients
- 🗺️ Food map — find nearby surplus food donations
- 🚗 AI-optimized pickup route planner for NGOs
- 🛒 Surplus marketplace — list and claim food donations
- 📊 Personal impact dashboard — CO₂ saved, meals rescued, water saved
- 🏆 Leaderboard and achievement badges
- 🔔 Real-time notifications via Socket.io
- 🛡️ Admin panel — user management, platform stats

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)
- Redis (optional — app works without it)

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/foodrescue.git
cd foodrescue
```

### 2. Set up environment variables

Copy the example files and fill in your credentials:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
cp ai-service/.env.example ai-service/.env
```

See **Environment Variables** section below for where to get each value.

### 3. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd client && npm install

# AI Service
cd ai-service && pip install -r requirements.txt
```

### 4. Run locally

Open 3 terminals:

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev

# Terminal 3 — AI Service
cd ai-service && uvicorn app.main:app --reload --port 8000
```

App runs at **http://localhost:5173**

### 5. Run with Docker

```bash
docker-compose up --build
```

## Environment Variables

### `server/.env`

| Variable | Description | Where to get it |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | [MongoDB Atlas](https://cloud.mongodb.com) |
| `JWT_SECRET` | Random 64-char string | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | Another random 64-char string | Same as above |
| `REDIS_URL` | Redis connection URL | Optional — `redis://localhost:6379` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | [cloudinary.com](https://cloudinary.com) |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Cloudinary dashboard |
| `AI_SERVICE_URL` | URL of the AI service | `http://localhost:8000` locally |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` for Gmail |
| `EMAIL_USER` | Your Gmail address | Your Gmail |
| `EMAIL_PASS` | Gmail App Password | [Google App Passwords](https://myaccount.google.com/apppasswords) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Google Cloud Console |
| `CLIENT_URL` | Frontend URL | `http://localhost:5173` locally |

### `client/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL e.g. `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Backend socket URL e.g. `http://localhost:5000` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Same as server Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset name |

### `ai-service/.env`

| Variable | Description | Where to get it |
|---|---|---|
| `GOOGLE_API_KEY` | Gemini API key | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `MODEL_PROVIDER` | AI provider | Set to `gemini` |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step deployment to Vercel + Render.

## License

MIT
