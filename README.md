# Rural Innovation Hub

> **Empowering grassroots innovators, farmers, and rural makers to protect, share, fund, and replicate frugally engineered inventions.**

Rural Innovation Hub is a full-stack, enterprise-grade platform specifically designed for rural technology discovery, open-hardware replications, community problem bounties, and grassroots intellectual property protection.

---

## Core Features

- **Grassroots Inventions Directory**: Filter by category (Agriculture, Water, Renewable Energy, Health, Small Tools), region, and cost. Includes step-by-step assembly guides with voice audio walkthroughs.
- **SHA-256 IP Fingerprinting & Certificates**: Generates verifiable cryptographic timestamp proofs and printable provenance certificates for rural innovators without complex patent bureaucracy.
- **Rule-Based Material Optimizer**: Suggests local, recycled, and low-cost alternatives (e.g., reclaimed bicycle hubs, scrap angle iron) to reduce fabrication costs.
- **Safety & Durability Scoring**: Heuristic safety matrix assessing electrical, high-pressure, and mechanical risk factors before field deployment.
- **Replication Tracker**: Document community builds across different states with photos and operational feedback.
- **Community Problem Bounties**: Farmers and panchayats post urgent rural challenges; makers submit prototype solutions.
- **Grassroots Crowdfunding & Parts Pledges**: Supporters pledge funds or spare parts (motors, pumps, bearings) to bring ideas to reality.
- **Makerspace & Rural Workshop Map**: Interactive Leaflet map of rural fab labs, tool libraries, and prototyping centers across India.
- **Heuristic Mentorship Matching**: Algorithmic scoring connecting innovators with specialized technical and agricultural mentors.
- **Live Real-time Messaging**: Authenticated WebSockets with offline queueing for community collaboration.
- **ESG & Impact Analytics**: Recharts visualizations calculating estimated CO₂ emissions prevented, liters of water conserved, and rural capital saved.
- **Role-Based Admin Moderation**: Approval workflow with audit logging, field-test verification badges, and feature flag management.
- **Ultra-Lite Mode & PWA**: Low-bandwidth friendly UI designed for 2G/3G connectivity, offline draft autosave, and lightweight asset loading.

---

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts, Leaflet / React-Leaflet, React Router DOM
- **Backend**: FastAPI, SQLAlchemy 2.0, PyMySQL, Pydantic v2, JWT Auth, WebSockets
- **Database**: MySQL 8.0 (strict relational schema with transactional outbox & audit trails)
- **Deployment**: Docker Compose, Vercel (Frontend), Render (Backend), GitHub Actions CI

---

## Quick Start

### Option A: Using Docker Compose (Recommended)
```bash
docker-compose up -d
```
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend Docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

### Option B: Local Development

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
cp ../.env.example .env
# Edit .env to set your MySQL DATABASE_URL

# Initialize schema and seed data
python seed.py

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## Demo Accounts (when `DEMO_MODE=true`)

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Innovator** | `ramesh@ruralhub.org` | `Innovator@123` | Submit inventions, track pledges, view certificates |
| **Investor** | `ananya@ruralhub.org` | `Investor@123` | Pledge funds & spare parts, sponsor bounties |
| **Mentor** | `prof.sharma@ruralhub.org` | `Mentor@123` | Review technical designs, accept mentorship requests |
| **Admin** | `admin@ruralhub.org` | `Admin@123` | Moderation queue, verify field tests, audit logs, feature flags |

---

## License
MIT License. Empowering open hardware for sustainable rural development.
