import "dotenv/config";

import { pool, query } from "../src/db/pool.js";
import { seed } from "./seed.js";

try {
  const usersResult = await query("SELECT EXISTS (SELECT 1 FROM users)");

  if (usersResult.rows[0].exists) {
    console.info("Seed skipped: database already contains users.");
  } else {
    const counts = await seed();
    console.info(
      `Initial seed complete: ${counts.users} users, ${counts.patients} patients, ${counts.appointments} appointments.`,
    );
  }
} catch (error) {
  console.error("Initial seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
