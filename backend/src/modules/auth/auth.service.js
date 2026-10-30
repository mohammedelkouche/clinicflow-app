import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { query } from "../../db/pool.js";
import { AppError } from "../../utils/AppError.js";

const dummyPasswordHash =
  "$2b$10$1Zp9WfpfKcFzbuMM0u5aSOszBrObJhZKtRoJL5GjCpnsPRuxGgbme";

function invalidCredentialsError() {
  return new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
}

export async function login({ email, password }) {
  const result = await query(
    `
      SELECT
        id,
        full_name AS "fullName",
        email,
        password_hash,
        role
      FROM users
      WHERE lower(email) = $1
    `,
    [email],
  );

  const user = result.rows[0];
  const passwordMatches = await bcrypt.compare(
    password,
    user?.password_hash ?? dummyPasswordHash,
  );

  if (!user || !passwordMatches) {
    throw invalidCredentialsError();
  }

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );

  return {
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getCurrentUser(userId) {
  const result = await query(
    `
      SELECT
        id,
        full_name AS "fullName",
        email,
        role
      FROM users
      WHERE id = $1
    `,
    [userId],
  );

  if (!result.rows[0]) {
    throw new AppError(401, "UNAUTHORIZED", "User no longer exists");
  }

  return result.rows[0];
}
