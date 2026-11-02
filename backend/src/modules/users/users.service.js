import bcrypt from "bcrypt";

import { env } from "../../config/env.js";
import { query } from "../../db/pool.js";

const userColumns = `
  id,
  full_name AS "fullName",
  email,
  role,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export async function createUser({ fullName, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  const result = await query(
    `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING ${userColumns}
    `,
    [fullName, email, passwordHash, role],
  );

  return result.rows[0];
}

export async function listUsers({ search, page, limit }) {
  const offset = (page - 1) * limit;
  const whereClause = `
    WHERE (
      $1 = ''
      OR full_name ILIKE '%' || $1 || '%'
      OR email ILIKE '%' || $1 || '%'
    )
  `;

  const [usersResult, countResult] = await Promise.all([
    query(
      `
        SELECT ${userColumns}
        FROM users
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `,
      [search, limit, offset],
    ),
    query(
      `
        SELECT COUNT(*)::integer AS total
        FROM users
        ${whereClause}
      `,
      [search],
    ),
  ]);

  const total = countResult.rows[0].total;

  return {
    data: usersResult.rows,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
