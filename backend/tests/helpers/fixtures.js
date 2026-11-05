import bcrypt from "bcrypt";
import request from "supertest";

import { pool } from "../../src/db/pool.js";

export const adminCredentials = {
  email: "admin@clinicflow.test",
  password: "Admin123!",
};

export const staffCredentials = {
  email: "staff@clinicflow.test",
  password: "Staff123!",
};

const adminPasswordHash = await bcrypt.hash(adminCredentials.password, 10);
const staffPasswordHash = await bcrypt.hash(staffCredentials.password, 10);

export async function seedTestUsers() {
  const result = await pool.query(
    `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES
        ('Test Admin', $1, $2, 'admin'),
        ('Test Staff', $3, $4, 'staff')
      RETURNING id, email, role
    `,
    [
      adminCredentials.email,
      adminPasswordHash,
      staffCredentials.email,
      staffPasswordHash,
    ],
  );

  return Object.fromEntries(result.rows.map((user) => [user.role, user]));
}

export async function login(app, credentials = adminCredentials) {
  const response = await request(app)
    .post("/api/auth/login")
    .send(credentials)
    .expect(200);

  return response.body.token;
}

export function authorization(token) {
  return `Bearer ${token}`;
}

export function patientValues(overrides = {}) {
  return {
    fullName: "Amina Test",
    cin: "TEST1001",
    phone: "+212600001001",
    birthDate: "1990-01-01",
    address: "Casablanca",
    ...overrides,
  };
}

export async function insertPatient(overrides = {}) {
  const patient = patientValues(overrides);
  const result = await pool.query(
    `
      INSERT INTO patients (full_name, cin, phone, birth_date, address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, full_name AS "fullName", cin
    `,
    [
      patient.fullName,
      patient.cin,
      patient.phone,
      patient.birthDate,
      patient.address,
    ],
  );

  return result.rows[0];
}

export function futureAppointmentDate(dayOffset, time) {
  const date = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000);
  return `${date.toISOString().slice(0, 10)}T${time}:00.000Z`;
}
