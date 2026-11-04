import assert from "node:assert/strict";
import test from "node:test";

import {
  createAppointment,
  listAppointments,
} from "../src/modules/appointments/appointments.service.js";
import { pool } from "../src/db/pool.js";

function appointmentValues(patientId, appointmentDate, status = "confirmed") {
  return {
    patientId,
    appointmentDate,
    status,
    reason: "Scheduling rule test",
    notes: null,
  };
}

function futureDate(dayOffset, time) {
  const date = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000);
  return `${date.toISOString().slice(0, 10)}T${time}:00.000Z`;
}

async function expectConflict(promise) {
  await assert.rejects(promise, (error) => {
    assert.equal(error.status, 409);
    assert.equal(error.code, "APPOINTMENT_CONFLICT");
    return true;
  });
}

test("confirmed appointment conflicts are patient-specific", async (t) => {
  const suffix = `${Date.now()}-${process.pid}`;
  const userResult = await pool.query(
    `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES ($1, $2, $3, 'staff')
      RETURNING id
    `,
    [
      "Appointment Test User",
      `appointment-test-${suffix}@example.test`,
      "test",
    ],
  );
  const createdBy = userResult.rows[0].id;
  const patientsResult = await pool.query(
    `
      INSERT INTO patients (full_name, cin, phone, birth_date)
      VALUES
        ('Appointment Test Patient A', $1, '+212600009991', '1990-01-01'),
        ('Appointment Test Patient B', $2, '+212600009992', '1990-01-01')
      RETURNING id
    `,
    [`TESTA${suffix}`, `TESTB${suffix}`],
  );
  const [patientA, patientB] = patientsResult.rows.map((row) => row.id);

  async function clearAppointments() {
    await pool.query(
      "DELETE FROM appointments WHERE patient_id = ANY($1::uuid[])",
      [[patientA, patientB]],
    );
  }

  try {
    await t.test("same patient at 10:00 and 10:20 conflicts", async () => {
      await clearAppointments();
      await createAppointment(
        appointmentValues(patientA, futureDate(400, "10:00")),
        createdBy,
      );
      await expectConflict(
        createAppointment(
          appointmentValues(patientA, futureDate(400, "10:20")),
          createdBy,
        ),
      );
    });

    await t.test("same patient at 10:00 and 10:30 is allowed", async () => {
      await clearAppointments();
      await createAppointment(
        appointmentValues(patientA, futureDate(401, "10:00")),
        createdBy,
      );
      const appointment = await createAppointment(
        appointmentValues(patientA, futureDate(401, "10:30")),
        createdBy,
      );
      assert.equal(appointment.status, "confirmed");
    });

    await t.test(
      "different patients at 10:00 and 10:20 are allowed",
      async () => {
        await clearAppointments();
        await createAppointment(
          appointmentValues(patientA, futureDate(402, "10:00")),
          createdBy,
        );
        const appointment = await createAppointment(
          appointmentValues(patientB, futureDate(402, "10:20")),
          createdBy,
        );
        assert.equal(appointment.status, "confirmed");
      },
    );

    await t.test(
      "pending and cancelled appointments do not conflict",
      async () => {
        await clearAppointments();
        await createAppointment(
          appointmentValues(patientA, futureDate(403, "10:00")),
          createdBy,
        );
        const pending = await createAppointment(
          appointmentValues(patientA, futureDate(403, "10:20"), "pending"),
          createdBy,
        );
        const cancelled = await createAppointment(
          appointmentValues(patientA, futureDate(403, "10:20"), "cancelled"),
          createdBy,
        );
        assert.equal(pending.status, "pending");
        assert.equal(cancelled.status, "cancelled");
      },
    );

    await t.test("new appointments appear first on page one", async () => {
      await clearAppointments();
      await createAppointment(
        appointmentValues(patientA, futureDate(404, "10:00"), "pending"),
        createdBy,
      );
      const newestAppointment = await createAppointment(
        appointmentValues(patientA, futureDate(405, "10:00"), "pending"),
        createdBy,
      );

      const result = await listAppointments({
        date: undefined,
        status: undefined,
        patientId: patientA,
        page: 1,
        limit: 10,
      });

      assert.equal(result.data[0].id, newestAppointment.id);
    });
  } finally {
    await pool.query("DELETE FROM patients WHERE id = ANY($1::uuid[])", [
      [patientA, patientB],
    ]);
    await pool.query("DELETE FROM users WHERE id = $1", [createdBy]);
    await pool.end();
  }
});
