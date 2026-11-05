import { pool } from "../../src/db/pool.js";

function assertTestDatabase() {
  const databaseName = decodeURIComponent(
    new URL(process.env.DATABASE_URL).pathname.replace(/^\//, ""),
  );

  if (!databaseName.endsWith("_test")) {
    throw new Error(
      `Refusing to reset '${databaseName}'. Test database names must end with '_test'.`,
    );
  }
}

export async function clearTestData() {
  assertTestDatabase();
  await pool.query(
    "TRUNCATE TABLE appointments, patients, users RESTART IDENTITY CASCADE",
  );
}

export async function closeTestDatabase() {
  await pool.end();
}
