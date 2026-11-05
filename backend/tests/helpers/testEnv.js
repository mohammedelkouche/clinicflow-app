import { config } from "dotenv";

config({ path: ".env.test", quiet: true });

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error(
    "TEST_DATABASE_URL is required. Copy .env.test.example to .env.test and configure clinicflow_test.",
  );
}

const databaseName = decodeURIComponent(
  new URL(testDatabaseUrl).pathname.replace(/^\//, ""),
);

if (!databaseName.endsWith("_test")) {
  throw new Error(
    `Refusing to run tests against '${databaseName}'. The database name must end with '_test'.`,
  );
}

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = testDatabaseUrl;
process.env.JWT_SECRET ??= "clinicflow_test_jwt_secret_change_me";
process.env.JWT_EXPIRES_IN ??= "1h";
process.env.CORS_ORIGIN ??= "http://localhost:5173";
process.env.CLINIC_TIMEZONE ??= "Africa/Casablanca";
process.env.BCRYPT_ROUNDS ??= "10";
