# Rural Innovation Hub - Deployment Guide

This guide details deployment options for **Rural Innovation Hub** across Docker, Vercel, Render, and standalone cloud servers.

---

## 1. Quick Local Deployment (Docker Compose)

The easiest way to run the full stack (FastAPI backend, MySQL 8.0, and React frontend) is with Docker Compose:

```bash
# 1. Clone or navigate to the repository
cd rural-innovation-hub

# 2. Start all containers in detached mode
docker-compose up -d

# 3. Check health and logs
docker-compose logs -f
```

- **Frontend**: http://localhost:5173
- **Backend API & Swagger Docs**: http://localhost:8000/docs
- **MySQL Database**: `localhost:3306` (`hub_user` / `hub_password`, database: `rural_innovation_hub`)

---

## 2. Production Deployment Architecture

```
                  [ Vercel CDN ]  <--- Users (Web / Mobile PWA)
                         |
                (HTTPS / WSS API calls)
                         |
                         v
              [ Render / Railway / ECS ]  <--- FastAPI Backend
                         |
                (Internal VPC / TLS)
                         |
                         v
              [ Managed MySQL 8.0 ]       <--- AWS RDS / PlanetScale / Aiven
```

---

## 3. Frontend Deployment on Vercel

1. Import the repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Configure Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com/api`
   - `VITE_WS_BASE_URL`: `wss://your-backend.onrender.com/api/ws`
   - `VITE_ENABLE_DEMO_LOGIN`: `false` (or `true` for staging)
5. Deploy. The `vercel.json` file automatically handles single-page application (SPA) client-side routing.

---

## 4. Backend Deployment on Render

1. Connect your repository on [Render](https://render.com).
2. Create a **Web Service** with:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add Environment Variables:
   - `DATABASE_URL`: `mysql+pymysql://<user>:<password>@<mysql-host>:3306/<database>`
   - `JWT_SECRET`: Generate a secure 64-character random string.
   - `JWT_ALGORITHM`: `HS256`
   - `CORS_ORIGINS`: `https://your-frontend.vercel.app`
   - `DEMO_MODE`: `false`

Alternatively, use Render Blueprint by linking `render.yaml`.

---

## 5. MySQL Database Setup

Ensure your production MySQL instance has:
- MySQL version 8.0+
- Character set: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`

Run the initial schema:
```bash
mysql -h <host> -u <user> -p <database> < backend/schema.sql
```

Then seed initial demo data if needed:
```bash
cd backend
python seed.py
```

---

## 6. PWA & Ultra-Lite Mode

- The app includes `manifest.json` and a Service Worker for offline app shell caching and draft persistence.
- Ultra-Lite mode optimizes bandwidth in rural 2G/3G zones by suppressing high-resolution media and heavy Framer Motion animations.
