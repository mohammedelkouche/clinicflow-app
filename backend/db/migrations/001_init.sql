-- ClinicFlow — initial schema (PostgreSQL 15+)
-- Run once on an empty database.

BEGIN;

-- Extensions -----------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_trgm;     -- fast ILIKE search on names
CREATE EXTENSION IF NOT EXISTS btree_gist;  -- needed for the exclusion constraint

-- Enums ----------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('admin', 'staff');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Shared trigger: keep updated_at fresh --------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users ----------------------------------------------------------------
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      TEXT        NOT NULL CHECK (length(trim(full_name)) > 0),
  email          TEXT        NOT NULL,
  password_hash  TEXT        NOT NULL,
  role           user_role   NOT NULL DEFAULT 'staff',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- case-insensitive unique email
CREATE UNIQUE INDEX users_email_lower_key ON users (lower(email));

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- patients -------------------------------------------------------------
CREATE TABLE patients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   TEXT        NOT NULL CHECK (length(trim(full_name)) > 0),
  cin         TEXT        NOT NULL CONSTRAINT patients_cin_key UNIQUE
                          CHECK (length(trim(cin)) > 0),
  phone       TEXT        NOT NULL CHECK (length(trim(phone)) > 0),
  birth_date  DATE        NOT NULL CHECK (birth_date <= CURRENT_DATE),
  address     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patients_full_name_trgm ON patients USING GIN (full_name gin_trgm_ops);
CREATE INDEX idx_patients_created_at ON patients (created_at DESC);

CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- appointments ---------------------------------------------------------
CREATE TABLE appointments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID               NOT NULL
                    REFERENCES patients (id) ON DELETE CASCADE,
  appointment_date  TIMESTAMPTZ        NOT NULL,
  status            appointment_status NOT NULL DEFAULT 'pending',
  reason            TEXT               NOT NULL CHECK (length(trim(reason)) > 0),
  notes             TEXT,
  created_by        UUID               NOT NULL
                    REFERENCES users (id) ON DELETE RESTRICT,
  created_at        TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

  -- Business rule: one patient cannot have two CONFIRMED appointments
  -- less than 30 minutes apart (each appointment blocks [start, start+30min)).
  -- AT TIME ZONE 'UTC' makes the expression immutable (required for constraints).
  CONSTRAINT appointments_no_confirmed_overlap
    EXCLUDE USING gist (
      patient_id WITH =,
      tsrange(
        (appointment_date AT TIME ZONE 'UTC'),
        (appointment_date AT TIME ZONE 'UTC') + INTERVAL '30 minutes'
      ) WITH &&
    ) WHERE (status = 'confirmed')
);

CREATE INDEX idx_appointments_patient_date ON appointments (patient_id, appointment_date);
CREATE INDEX idx_appointments_date         ON appointments (appointment_date);
CREATE INDEX idx_appointments_status       ON appointments (status);
CREATE INDEX idx_appointments_created_by   ON appointments (created_by);

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
