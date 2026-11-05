import { readFile } from "node:fs/promises";

import { config } from "dotenv";
import pg from "pg";

const { Pool } = pg;
const migrationFile = new URL("../db/migrations/001_init.sql", import.meta.url);

export default async function globalSetup() {
  config({ path: ".env.test", quiet: true });

  const testDatabaseUrl = process.env.TEST_DATABASE_URL;

  if (!testDatabaseUrl) {
    throw new Error("TEST_DATABASE_URL is required for Jest global setup.");
  }

  const databaseName = decodeURIComponent(
    new URL(testDatabaseUrl).pathname.replace(/^\//, ""),
  );

  if (!databaseName.endsWith("_test")) {
    throw new Error(
      `Refusing to reset '${databaseName}'. Test database names must end with '_test'.`,
    );
  }

  const testPool = new Pool({ connectionString: testDatabaseUrl });

  try {
    await testPool.query("DROP SCHEMA IF EXISTS public CASCADE");
    await testPool.query("CREATE SCHEMA public");
    await testPool.query(await readFile(migrationFile, "utf8"));
  } finally {
    await testPool.end();
  }
}
