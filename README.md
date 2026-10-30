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

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The backend listens on `http://localhost:4000` and the frontend on `http://localhost:5173` by default.

## PostgreSQL database

Create an empty database named `clinicflow`, then set `DATABASE_URL` in `backend/.env` using the PostgreSQL username and password configured on your computer:

```dotenv
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/clinicflow
```

Run the schema migration and seed data from the backend folder:

```bash
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

## Testing the API with Postman

Start the backend and use `http://localhost:4000/api` as the base URL.

### 1. Check that the API is running

- Method: `GET`
- URL: `http://localhost:4000/api/health`
- Authorization: none

Expected response:

```json
{ "status": "ok" }
```

### 2. Log in and obtain a token

- Method: `POST`
- URL: `http://localhost:4000/api/auth/login`
- In **Body**, select **raw**, then select **JSON**.

Admin body:

```json
{
  "email": "admin@clinicflow.test",
  "password": "Admin123!"
}
```

Postman adds `Content-Type: application/json` when JSON is selected. The response contains a `token`:

```json
{
  "token": "eyJ...",
  "user": {
    "id": "...",
    "fullName": "ClinicFlow Admin",
    "email": "admin@clinicflow.test",
    "role": "admin"
  }
}
```

Copy only the token value, without quotation marks.

### 3. Add the token to authenticated requests

For `/auth/me` and every `/patients` request:

1. Open the request's **Authorization** tab.
2. Select **Bearer Token** as the type.
3. Paste the copied token into the **Token** field.

Postman will create this header automatically:

```text
Authorization: Bearer eyJ...
```

Alternatively, add it manually in the **Headers** tab with key `Authorization` and value `Bearer YOUR_TOKEN`.

### 4. Test the current user

- Method: `GET`
- URL: `http://localhost:4000/api/auth/me`
- Authorization: Bearer token

### 5. Create a patient

- Method: `POST`
- URL: `http://localhost:4000/api/patients`
- Authorization: Bearer token
- Body: **raw → JSON**

```json
{
  "fullName": "Ahmed Example",
  "cin": "ab987654",
  "phone": "+212600001234",
  "birthDate": "1992-05-14",
  "address": "Casablanca"
}
```

The API trims and converts the CIN to uppercase. Copy `data.id` from the response for the details, update, and delete requests.

### 6. List and search patients

- List: `GET http://localhost:4000/api/patients?page=1&limit=10`
- Search by name: `GET http://localhost:4000/api/patients?search=ahmed`
- Search by CIN prefix: `GET http://localhost:4000/api/patients?search=AB98`
- Authorization: Bearer token

### 7. Get one patient

- Method: `GET`
- URL: `http://localhost:4000/api/patients/PATIENT_ID`
- Authorization: Bearer token

Replace `PATIENT_ID` with the `data.id` value returned by the API.

### 8. Update a patient

- Method: `PUT`
- URL: `http://localhost:4000/api/patients/PATIENT_ID`
- Authorization: Bearer token
- Body: **raw → JSON** with all patient fields

```json
{
  "fullName": "Ahmed Updated",
  "cin": "AB987654",
  "phone": "+212600005678",
  "birthDate": "1992-05-14",
  "address": "Rabat"
}
```

### 9. Delete a patient

- Method: `DELETE`
- URL: `http://localhost:4000/api/patients/PATIENT_ID`
- Authorization: an **admin** Bearer token

An admin receives `204 No Content`. A staff token receives `403 Forbidden`.
