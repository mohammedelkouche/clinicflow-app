import { env } from "../../config/env.js";
import { query } from "../../db/pool.js";

export async function getDashboardStats() {
  const [patientsResult, todayResult, statusResult] = await Promise.all([
    query("SELECT COUNT(*)::integer AS count FROM patients"),
    query(
      `
        SELECT COUNT(*)::integer AS count
        FROM appointments
        WHERE appointment_date >= (
          date_trunc('day', NOW() AT TIME ZONE $1) AT TIME ZONE $1
        )
          AND appointment_date < (
            (
              date_trunc('day', NOW() AT TIME ZONE $1)
              + INTERVAL '1 day'
            ) AT TIME ZONE $1
          )
      `,
      [env.CLINIC_TIMEZONE],
    ),
    query(`
      SELECT status, COUNT(*)::integer AS count
      FROM appointments
      WHERE status IN ('pending', 'confirmed')
      GROUP BY status
    `),
  ]);

  const statusCounts = Object.fromEntries(
    statusResult.rows.map((row) => [row.status, row.count]),
  );

  return {
    totalPatients: patientsResult.rows[0].count,
    appointmentsToday: todayResult.rows[0].count,
    pending: statusCounts.pending ?? 0,
    confirmed: statusCounts.confirmed ?? 0,
  };
}
