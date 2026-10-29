import "dotenv/config";

import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { pool, query, withTransaction } from "../src/db/pool.js";

const migrationsDirectory = fileURLToPath(
  new URL("./migrations/", import.meta.url),
);

function removeTransactionWrapper(sql) {
  return sql
    .replace(/^(?:\uFEFF)?\s*BEGIN;\s*/i, "")
    .replace(/\s*COMMIT;\s*$/i, "");
}

async function migrate() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrationFiles = (await readdir(migrationsDirectory))
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort((first, second) => first.localeCompare(second));

  const appliedResult = await query("SELECT name FROM schema_migrations");
  const appliedMigrations = new Set(
    appliedResult.rows.map((migration) => migration.name),
  );

  for (const fileName of migrationFiles) {
    if (appliedMigrations.has(fileName)) {
      continue;
    }

    const fileUrl = new URL(`./migrations/${fileName}`, import.meta.url);
    const migrationSql = removeTransactionWrapper(
      await readFile(fileUrl, "utf8"),
    );

    await withTransaction(async (client) => {
      await client.query(migrationSql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
        fileName,
      ]);
    });

    console.info(`Applied migration: ${fileName}`);
  }

  if (migrationFiles.every((fileName) => appliedMigrations.has(fileName))) {
    console.info("Database is already up to date.");
  }
}

try {
  await migrate();
} catch (error) {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
