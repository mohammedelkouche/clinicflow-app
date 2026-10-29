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

## PostgreSQL database

Create an empty database named `clinicflow`, then set `DATABASE_URL` in `backend/.env` using the PostgreSQL username and password configured on your computer:

```dotenv
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/clinicflow
```

Run the schema migration and seed data from the backend folder:

```powershell
npm run db:migrate
npm run db:seed
```

The migration command is safe to run repeatedly. The seed command resets and recreates the development records each time.

### pgAdmin connection

Register or open the local PostgreSQL server with these values:

- Host: `localhost`
- Port: `5432`
- Maintenance database: `postgres`
- Username: `postgres`
- Password: the password chosen during PostgreSQL installation

After connecting, expand **Servers → PostgreSQL → Databases → clinicflow → Schemas → public → Tables**. Right-click a table and select **View/Edit Data → All Rows** to inspect its data. Use **Tools → Query Tool** for SQL queries.

### Seed accounts

- Admin: `admin@clinicflow.test` / `Admin123!`
- Staff: `staff1@clinicflow.test` / `Staff123!`
- Staff: `staff2@clinicflow.test` / `Staff123!`
