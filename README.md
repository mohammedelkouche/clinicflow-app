# ClinicFlow

ClinicFlow is a PERN application for managing patients and appointments in a small clinic.

## Project structure

- `backend/` — Node.js and Express API
- `frontend/` — React and Vite client
- `docs/` — architecture, database design, and implementation roadmap

## Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL 15 or newer (required from Phase 1)

## Setup

Install dependencies and copy the environment templates before starting each app:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

In a second terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

The backend listens on `http://localhost:4000` and the frontend on `http://localhost:5173` by default.

Database migration and seed commands are registered as `npm run db:migrate` and `npm run db:seed`; their implementation belongs to Phase 1.
