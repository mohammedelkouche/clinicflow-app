# ClinicFlow

ClinicFlow is a small-clinic management application built with PostgreSQL,
Express, React, and Node.js. Clinic staff can sign in, manage patient records,
schedule appointments, filter the clinic schedule, and view dashboard totals.

## Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL 15 or newer
- pgAdmin 4 (optional, but useful for creating and viewing the database)
- Git Bash for the commands below

## 1. Create the PostgreSQL database

### With pgAdmin

1. Open pgAdmin and connect to your local PostgreSQL server.
2. Expand the server, right-click **Databases**, and choose
   **Create → Database**.
3. Enter `clinicflow` as the database name and save.

The usual local connection values are:

- Host: `localhost`
- Port: `5432`
- Maintenance database: `postgres`
- Username: `postgres`
- Password: the password chosen when PostgreSQL was installed

Alternatively, if PostgreSQL command-line tools are available in Git Bash:

```bash
createdb -U postgres clinicflow
```

## 2. Configure and prepare the backend

From the repository root:

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and replace the example database password and JWT secret:

```dotenv
PORT=4000
DATABASE_URL=postgres://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/clinicflow
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
CLINIC_TIMEZONE=Africa/Casablanca
BCRYPT_ROUNDS=10
```

If the PostgreSQL password contains reserved URL characters such as `@`, `:`,
`/`, or `#`, URL-encode those characters in `DATABASE_URL`.

Create the tables and load the development data:

```bash
npm run db:migrate && npm run db:seed
```

The migration command is safe to run more than once. The seed command is for
development: every run resets the users, patients, and appointments before
inserting the sample records.

Start the API:

```bash
npm run dev
```

Verify it at `http://localhost:4000/api/health`. The expected response is:

```json
{ "status": "ok" }
```

## 3. Configure and run the frontend

Keep the backend running and open a second Git Bash terminal at the repository
root:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. The frontend environment should contain:

```dotenv
VITE_API_URL=http://localhost:4000/api
```

`CORS_ORIGIN` in `backend/.env` must exactly match the frontend origin. Restart
the backend after changing an environment variable.

## Seed accounts

| Role  | Email                    | Password    |
| ----- | ------------------------ | ----------- |
| Admin | `admin@clinicflow.test`  | `Admin123!` |
| Staff | `staff1@clinicflow.test` | `Staff123!` |
| Staff | `staff2@clinicflow.test` | `Staff123!` |

Only admins can delete patients. Both admins and staff can create and edit
patients and manage appointments.

## API summary

All API routes use the `/api` prefix. Except for health and login, requests need
the header `Authorization: Bearer <token>`.

| Method   | Endpoint                   | Access       | Purpose                      |
| -------- | -------------------------- | ------------ | ---------------------------- |
| `GET`    | `/health`                  | Public       | API health check             |
| `POST`   | `/auth/login`              | Public       | Sign in and receive a JWT    |
| `GET`    | `/auth/me`                 | Admin, staff | Get the signed-in user       |
| `POST`   | `/patients`                | Admin, staff | Create a patient             |
| `GET`    | `/patients`                | Admin, staff | Search and paginate patients |
| `GET`    | `/patients/:id`            | Admin, staff | Get one patient              |
| `PUT`    | `/patients/:id`            | Admin, staff | Update one patient           |
| `DELETE` | `/patients/:id`            | Admin only   | Delete patient and visits    |
| `POST`   | `/appointments`            | Admin, staff | Schedule an appointment      |
| `GET`    | `/appointments`            | Admin, staff | Filter and paginate schedule |
| `PATCH`  | `/appointments/:id/status` | Admin, staff | Change appointment status    |
| `GET`    | `/dashboard/stats`         | Admin, staff | Get dashboard totals         |

Patient list query parameters are `search`, `page`, and `limit`. Appointment
list query parameters are `date`, `status`, `patientId`, `page`, and `limit`.

## Testing authentication in Postman

1. Send `POST http://localhost:4000/api/auth/login`.
2. In **Body**, select **raw → JSON** and use:

   ```json
   {
     "email": "admin@clinicflow.test",
     "password": "Admin123!"
   }
   ```

3. Copy the `token` from the response.
4. For a protected request, open **Authorization**, choose **Bearer Token**, and
   paste the token. Postman creates this header:

   ```text
   Authorization: Bearer YOUR_TOKEN
   ```

For JSON `POST`, `PUT`, and `PATCH` requests, select **raw → JSON** so Postman
also sends `Content-Type: application/json`.

## Confirmed-appointment rule

A patient cannot have two **confirmed** appointments whose start times are less
than 30 minutes apart. For example, 10:00 and 10:20 conflict, while 10:00 and
10:30 are allowed. Pending and cancelled appointments do not block a time.

The service checks the rule inside a database transaction with a patient-level
advisory lock. PostgreSQL also enforces it with an exclusion constraint, so two
parallel requests cannot bypass the rule. A conflict returns HTTP `409` with the
code `APPOINTMENT_CONFLICT`.

## Design decisions

- The backend follows `routes → controllers → services → database` layering.
- SQL uses `pg` directly and all values are passed as parameters; no ORM is
  needed for this project.
- Request bodies, route parameters, and query parameters are validated with
  Zod.
- The API uses one central JSON error handler and never returns password hashes.
- The frontend uses React context only for authentication and local state for
  page data; Redux would add unnecessary complexity.
- Patient deletion is admin-only and cascades to that patient's appointments.
- Calendar dates are mapped carefully so they do not move by one day because of
  browser or database timezone conversion.

## Quality checks

Run these before committing:

```bash
cd backend
npm run lint
npm run format:check

cd ../frontend
npm run lint
npm run build
```

To apply backend formatting, run `npm run format` from `backend`.

## Viewing data in pgAdmin

Expand
**Servers → PostgreSQL → Databases → clinicflow → Schemas → public → Tables**.
Right-click a table and choose **View/Edit Data → All Rows**. Use
**Tools → Query Tool** for SQL queries.

## Common local issue: port 4000 is already in use

If the health endpoint already returns `{ "status": "ok" }`, a backend process
is already running and a second `npm run dev` will fail with `EADDRINUSE`. In Git
Bash, identify the Windows process with:

```bash
netstat -ano | grep ':4000'
```

Stop the old terminal with `Ctrl+C`, or end the listed PID in Windows Task
Manager, then start the backend once.
