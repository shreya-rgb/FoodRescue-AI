# 🥗 FoodRescue AI

> An AI-powered platform to reduce food waste — track your inventory, donate surplus food, discover recipes from expiring ingredients, and coordinate NGO pickups with optimized routes.

**Live Demo → [food-rescue-ai-six.vercel.app](https://food-rescue-ai-six.vercel.app)**

---

## Screenshots

> Dashboard · Food Map · AI Recipes · Leaderboard · Admin Panel

---

## Features

| Feature | Description |
|---|---|
| 📸 AI Food Scanner | Scan food with your camera — Gemini Vision auto-fills name, category & expiry |
| 🧠 Smart Expiry Prediction | AI predicts expiry dates based on food type and storage |
| 🍳 Recipe Generator | Get AI-powered recipes from your expiring ingredients |
| 🗺️ Food Map | Find nearby surplus food donations on an interactive map |
| 🚗 Route Optimizer | AI-optimized pickup routes for NGOs using nearest-neighbor TSP |
| 🛒 Surplus Marketplace | List and claim food donations in your community |
| 📊 Impact Dashboard | Track CO₂ saved, meals rescued, water saved, money saved |
| 🏆 Leaderboard | Community rankings with achievement badges |
| 🔔 Real-time Notifications | Live updates via Socket.io |
| 🛡️ Admin Panel | User management, verification, platform analytics |
| 🔐 Auth | Email/password + Google OAuth, JWT with refresh tokens |

---

## Tech Stack

### Frontend
- **React 18** + Vite
- **Zustand** — state management
- **React Leaflet** — interactive maps
- **Recharts** — data visualization
- **Framer Motion** — animations
- **Socket.io Client** — real-time updates

### Backend
- **Node.js** + Express
- **MongoDB** + Mongoose
- **Socket.io** — real-time notifications
- **Redis** — caching (optional)
- **Cloudinary** — image storage
- **Nodemailer** — email notifications
- **JWT** — authentication
- **Google OAuth** — social login

### AI Service
- **Python** + FastAPI
- **Google Gemini** — food recognition, recipe generation, expiry prediction
- **Custom TSP algorithm** — route optimization

---

## Project Structure

```
foodrescue/
├── client/          # React frontend (Vite)
├── server/          # Node.js backend API
├── ai-service/      # Python FastAPI AI microservice
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.12+
- MongoDB (local or Atlas)

### 1. Clone the repo

```bash
git clone https://github.com/shreya-rgb/FoodRescue-AI.git
cd FoodRescue-AI
```

### 2. Set up environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
cp ai-service/.env.example ai-service/.env
```

Fill in your credentials — see the table below.

### 3. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd client && npm install

# AI Service
cd ai-service && pip install -r requirements.txt
```

### 4. Run locally

Open 3 terminals:

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd client && npm run dev

# Terminal 3 — AI Service (http://localhost:8000)
cd ai-service && uvicorn app.main:app --reload --port 8000
```

### 5. Run with Docker

```bash
docker-compose up --build
```

---

## Environment Variables

### `server/.env`

| Variable | Description | Where to get it |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | [MongoDB Atlas](https://cloud.mongodb.com) — free tier |
| `JWT_SECRET` | Random 64-char secret | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | Another random 64-char secret | Same command as above |
| `JWT_EXPIRE` | Token expiry | `7d` |
| `REDIS_URL` | Redis URL (optional) | `redis://localhost:6379` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | [cloudinary.com](https://cloudinary.com) — free tier |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Cloudinary dashboard |
| `AI_SERVICE_URL` | AI microservice URL | `http://localhost:8000` locally |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Gmail address | Your Gmail |
| `EMAIL_PASS` | Gmail app password | [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Google Cloud Console |
| `CLIENT_URL` | Frontend URL | `http://localhost:5173` locally |

### `client/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL — `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Backend socket URL — `http://localhost:5000` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Same as server Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset |

### `ai-service/.env`

| Variable | Description | Where to get it |
|---|---|---|
| `GOOGLE_API_KEY` | Gemini API key | [Google AI Studio](https://aistudio.google.com/app/apikey) — free |
| `MODEL_PROVIDER` | AI provider | Set to `gemini` |

---

## Deployment

The app is deployed across 3 services:

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | [food-rescue-ai-six.vercel.app](https://food-rescue-ai-six.vercel.app) |
| Backend | Render | [foodrescue-server.onrender.com](https://foodrescue-server.onrender.com) |
| AI Service | Render | [foodrescue-ai.onrender.com](https://foodrescue-ai.onrender.com) |

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full step-by-step deployment guide.

---

## API Overview

| Route | Description |
|---|---|
| `POST /api/auth/register` | Register new user |
| `POST /api/auth/login` | Login |
| `GET /api/food` | Get user's food inventory |
| `POST /api/food/scan` | AI food recognition from image |
| `GET /api/listings/nearby` | Get nearby food listings |
| `POST /api/claims` | Claim a food listing |
| `POST /api/claims/optimize-route` | AI route optimization |
| `POST /api/recipes/generate` | Generate AI recipes |
| `GET /api/impact/me` | Get personal impact stats |
| `GET /api/users/leaderboard` | Community leaderboard |
| `GET /api/admin/dashboard` | Admin platform stats |

---

## User Roles

| Role | Access |
|---|---|
| **Household** | Track inventory, scan food, get recipes, view impact |
| **Restaurant** | List surplus food, manage donations |
| **NGO / Food Bank** | Browse listings, claim food, plan pickup routes |
| **Admin** | Full platform management, user verification & moderation |

---

## License

MIT — feel free to use, modify, and distribute.

---

<p align="center">Built with ❤️ to fight food waste</p>
