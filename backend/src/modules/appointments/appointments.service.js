import { env } from "../../config/env.js";
import { query, withTransaction } from "../../db/pool.js";
import { AppError } from "../../utils/AppError.js";

const nilUuid = "00000000-0000-0000-0000-000000000000";

const appointmentColumns = `
  a.id,
  a.patient_id AS "patientId",
  p.full_name AS "patientName",
  a.appointment_date AS "appointmentDate",
  a.status,
  a.reason,
  a.notes,
  a.created_by AS "createdBy",
  a.created_at AS "createdAt",
  a.updated_at AS "updatedAt"
`;

function appointmentNotFoundError() {
  return new AppError(404, "NOT_FOUND", "Appointment not found");
}

function appointmentConflictError() {
  return new AppError(
    409,
    "APPOINTMENT_CONFLICT",
    "This patient already has a confirmed appointment within 30 minutes",
  );
}

async function findAppointment(client, appointmentId) {
  const result = await client.query(
    `
      SELECT ${appointmentColumns}
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      WHERE a.id = $1
    `,
    [appointmentId],
  );

  return result.rows[0];
}

async function lockPatient(client, patientId) {
  await client.query("SELECT pg_advisory_xact_lock(hashtext($1::text))", [
    patientId,
  ]);
}

async function ensureNoConfirmedConflict(
  client,
  patientId,
  appointmentId,
  appointmentDate,
) {
  const result = await client.query(
    `
      SELECT 1
      FROM appointments
      WHERE patient_id = $1
        AND status = 'confirmed'
        AND id <> $2
        AND appointment_date > $3::timestamptz - INTERVAL '30 minutes'
        AND appointment_date < $3::timestamptz + INTERVAL '30 minutes'
      LIMIT 1
    `,
    [patientId, appointmentId, appointmentDate],
  );

  if (result.rowCount > 0) {
    throw appointmentConflictError();
  }
}

export async function createAppointment(
  { patientId, appointmentDate, status, reason, notes },
  createdBy,
) {
  return withTransaction(async (client) => {
    const patientResult = await client.query(
      "SELECT id FROM patients WHERE id = $1 FOR KEY SHARE",
      [patientId],
    );

    if (!patientResult.rows[0]) {
      throw new AppError(404, "NOT_FOUND", "Patient not found");
    }

    await lockPatient(client, patientId);

    if (status === "confirmed") {
      await ensureNoConfirmedConflict(
        client,
        patientId,
        nilUuid,
        appointmentDate,
      );
    }

    const insertResult = await client.query(
      `
        INSERT INTO appointments (
          patient_id,
          appointment_date,
          status,
          reason,
          notes,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      [patientId, appointmentDate, status, reason, notes, createdBy],
    );

    return findAppointment(client, insertResult.rows[0].id);
  });
}

export async function listAppointments({
  date,
  status,
  patientId,
  page,
  limit,
}) {
  const offset = (page - 1) * limit;
  const filterValues = [
    date ?? null,
    status ?? null,
    patientId ?? null,
    env.CLINIC_TIMEZONE,
  ];
  const filters = `
    WITH filters AS (
      SELECT
        $1::date AS filter_date,
        $2::appointment_status AS filter_status,
        $3::uuid AS filter_patient_id
    )
  `;
  const whereClause = `
    WHERE (
      f.filter_date IS NULL
      OR (
        a.appointment_date >= (f.filter_date::timestamp AT TIME ZONE $4)
        AND a.appointment_date < (
          (f.filter_date + 1)::timestamp AT TIME ZONE $4
        )
      )
    )
      AND (f.filter_status IS NULL OR a.status = f.filter_status)
      AND (f.filter_patient_id IS NULL OR a.patient_id = f.filter_patient_id)
  `;

  const [appointmentsResult, countResult] = await Promise.all([
    query(
      `
        ${filters}
        SELECT ${appointmentColumns}
        FROM appointments a
        JOIN patients p ON p.id = a.patient_id
        CROSS JOIN filters f
        ${whereClause}
        ORDER BY a.appointment_date ASC
        LIMIT $5 OFFSET $6
      `,
      [...filterValues, limit, offset],
    ),
    query(
      `
        ${filters}
        SELECT COUNT(*)::integer AS total
        FROM appointments a
        CROSS JOIN filters f
        ${whereClause}
      `,
      filterValues,
    ),
  ]);

  const total = countResult.rows[0].total;

  return {
    data: appointmentsResult.rows,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateAppointmentStatus(appointmentId, status) {
  return withTransaction(async (client) => {
    const appointmentResult = await client.query(
      `
        SELECT id, patient_id, appointment_date
        FROM appointments
        WHERE id = $1
        FOR UPDATE
      `,
      [appointmentId],
    );
    const appointment = appointmentResult.rows[0];

    if (!appointment) {
      throw appointmentNotFoundError();
    }

    await lockPatient(client, appointment.patient_id);

    if (status === "confirmed") {
      await ensureNoConfirmedConflict(
        client,
        appointment.patient_id,
        appointment.id,
        appointment.appointment_date,
      );
    }

    await client.query("UPDATE appointments SET status = $1 WHERE id = $2", [
      status,
      appointmentId,
    ]);

    return findAppointment(client, appointmentId);
  });
}
