import "dotenv/config";

import bcrypt from "bcrypt";

import { pool, withTransaction } from "../src/db/pool.js";

const clinicTimezone = process.env.CLINIC_TIMEZONE ?? "Africa/Casablanca";
const bcryptRounds = Number(process.env.BCRYPT_ROUNDS ?? 10);

if (!Number.isInteger(bcryptRounds) || bcryptRounds < 10) {
  throw new Error("BCRYPT_ROUNDS must be an integer of at least 10.");
}

const patients = [
  [
    "Amina El Mansouri",
    "AB123456",
    "+212600000001",
    "1990-04-12",
    "Casablanca",
  ],
  ["Youssef Alaoui", "CD234567", "+212600000002", "1985-09-23", "Rabat"],
  ["Sara Benali", "EF345678", "+212600000003", "1997-01-18", "Mohammedia"],
  ["Omar Idrissi", "GH456789", "+212600000004", "1978-11-05", "Casablanca"],
  ["Lina Amrani", "IJ567890", "+212600000005", "2001-06-30", "Bouskoura"],
];

const appointments = [
  [
    "AB123456",
    0,
    "09:00",
    "pending",
    "General consultation",
    null,
    "staff1@clinicflow.test",
  ],
  [
    "AB123456",
    0,
    "10:00",
    "confirmed",
    "Blood pressure follow-up",
    "Bring recent test results",
    "admin@clinicflow.test",
  ],
  [
    "CD234567",
    0,
    "11:00",
    "cancelled",
    "Routine check-up",
    null,
    "staff2@clinicflow.test",
  ],
  [
    "AB123456",
    0,
    "10:30",
    "confirmed",
    "Lab results review",
    null,
    "staff1@clinicflow.test",
  ],
  [
    "CD234567",
    1,
    "09:00",
    "pending",
    "Vaccination consultation",
    null,
    "staff2@clinicflow.test",
  ],
  [
    "EF345678",
    1,
    "10:00",
    "confirmed",
    "Annual physical",
    null,
    "admin@clinicflow.test",
  ],
  [
    "GH456789",
    2,
    "11:00",
    "pending",
    "Follow-up consultation",
    null,
    "staff1@clinicflow.test",
  ],
  [
    "IJ567890",
    -1,
    "15:00",
    "cancelled",
    "Nutrition consultation",
    "Patient requested cancellation",
    "staff2@clinicflow.test",
  ],
  [
    "CD234567",
    3,
    "14:00",
    "confirmed",
    "Medication review",
    null,
    "admin@clinicflow.test",
  ],
  [
    "EF345678",
    4,
    "16:00",
    "pending",
    "General consultation",
    null,
    "staff1@clinicflow.test",
  ],
];

async function seed() {
  const adminPasswordHash = await bcrypt.hash("Admin123!", bcryptRounds);
  const staffPasswordHash = await bcrypt.hash("Staff123!", bcryptRounds);

  return withTransaction(async (client) => {
    await client.query(
      "TRUNCATE TABLE appointments, patients, users RESTART IDENTITY CASCADE",
    );

    const usersResult = await client.query(
      `
        INSERT INTO users (full_name, email, password_hash, role)
        VALUES
          ($1, $2, $3, 'admin'),
          ($4, $5, $6, 'staff'),
          ($7, $8, $9, 'staff')
        RETURNING id, email
      `,
      [
        "ClinicFlow Admin",
        "admin@clinicflow.test",
        adminPasswordHash,
        "Nadia Staff",
        "staff1@clinicflow.test",
        staffPasswordHash,
        "Karim Staff",
        "staff2@clinicflow.test",
        staffPasswordHash,
      ],
    );

    const userIds = new Map(
      usersResult.rows.map((user) => [user.email, user.id]),
    );
    const patientIds = new Map();

    for (const [fullName, cin, phone, birthDate, address] of patients) {
      const patientResult = await client.query(
        `
          INSERT INTO patients (full_name, cin, phone, birth_date, address)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, cin
        `,
        [fullName, cin, phone, birthDate, address],
      );

      patientIds.set(patientResult.rows[0].cin, patientResult.rows[0].id);
    }

    for (const [
      patientCin,
      dayOffset,
      appointmentTime,
      status,
      reason,
      notes,
      creatorEmail,
    ] of appointments) {
      await client.query(
        `
          INSERT INTO appointments (
            patient_id,
            appointment_date,
            status,
            reason,
            notes,
            created_by
          )
          VALUES (
            $1,
            (
              date_trunc('day', NOW() AT TIME ZONE $2)
              + ($3::integer * INTERVAL '1 day')
              + $4::interval
            ) AT TIME ZONE $2,
            $5,
            $6,
            $7,
            $8
          )
        `,
        [
          patientIds.get(patientCin),
          clinicTimezone,
          dayOffset,
          appointmentTime,
          status,
          reason,
          notes,
          userIds.get(creatorEmail),
        ],
      );
    }

    const countsResult = await client.query(`
      SELECT
        (SELECT COUNT(*)::integer FROM users) AS users,
        (SELECT COUNT(*)::integer FROM patients) AS patients,
        (SELECT COUNT(*)::integer FROM appointments) AS appointments
    `);

    return countsResult.rows[0];
  });
}

try {
  const counts = await seed();
  console.info(
    `Seed complete: ${counts.users} users, ${counts.patients} patients, ${counts.appointments} appointments.`,
  );
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
