import { query } from "../../db/pool.js";
import { AppError } from "../../utils/AppError.js";

const patientColumns = `
  id,
  full_name AS "fullName",
  cin,
  phone,
  birth_date AS "birthDate",
  address,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

function patientNotFoundError() {
  return new AppError(404, "NOT_FOUND", "Patient not found");
}

export async function createPatient({
  fullName,
  cin,
  phone,
  birthDate,
  address,
}) {
  const result = await query(
    `
      INSERT INTO patients (full_name, cin, phone, birth_date, address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING ${patientColumns}
    `,
    [fullName, cin, phone, birthDate, address],
  );

  return result.rows[0];
}

export async function listPatients({ search, page, limit }) {
  const offset = (page - 1) * limit;
  const whereClause = `
    WHERE (
      $1 = ''
      OR full_name ILIKE '%' || $1 || '%'
      OR cin ILIKE $1 || '%'
    )
  `;

  const [patientsResult, countResult] = await Promise.all([
    query(
      `
        SELECT ${patientColumns}
        FROM patients
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
      [search, limit, offset],
    ),
    query(
      `
        SELECT COUNT(*)::integer AS total
        FROM patients
        ${whereClause}
      `,
      [search],
    ),
  ]);

  const total = countResult.rows[0].total;

  return {
    data: patientsResult.rows,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getPatientById(patientId) {
  const result = await query(
    `
      SELECT ${patientColumns}
      FROM patients
      WHERE id = $1
    `,
    [patientId],
  );

  if (!result.rows[0]) {
    throw patientNotFoundError();
  }

  return result.rows[0];
}

export async function updatePatient(
  patientId,
  { fullName, cin, phone, birthDate, address },
) {
  const result = await query(
    `
      UPDATE patients
      SET
        full_name = $1,
        cin = $2,
        phone = $3,
        birth_date = $4,
        address = $5
      WHERE id = $6
      RETURNING ${patientColumns}
    `,
    [fullName, cin, phone, birthDate, address, patientId],
  );

  if (!result.rows[0]) {
    throw patientNotFoundError();
  }

  return result.rows[0];
}

export async function deletePatient(patientId) {
  const result = await query(
    "DELETE FROM patients WHERE id = $1 RETURNING id",
    [patientId],
  );

  if (!result.rows[0]) {
    throw patientNotFoundError();
  }
}
