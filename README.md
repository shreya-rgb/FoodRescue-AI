# 🥗 FoodRescue AI

> An AI-powered platform to reduce food waste — track your inventory, donate surplus food, discover recipes from expiring ingredients, and coordinate NGO pickups with optimized routes.

**Live Demo → [food-rescue-ai-six.vercel.app](https://food-rescue-ai-six.vercel.app)**

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

Fill in your credentials in each `.env` file.

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

## User Roles

| Role | Access |
|---|---|
| **Household** | Track inventory, scan food, get recipes, view impact |
| **Restaurant** | List surplus food, manage donations |
| **NGO / Food Bank** | Browse listings, claim food, plan pickup routes |
| **Admin** | Full platform management, user verification & moderation |

---

<p align="center">Built with ❤️ to fight food waste</p>
