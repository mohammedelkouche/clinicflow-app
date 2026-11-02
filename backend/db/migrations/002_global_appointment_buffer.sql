BEGIN;

-- The clinic has one shared appointment resource. Confirmed appointments
-- therefore cannot overlap, regardless of which patient they belong to.
-- A trigger is used instead of adding a new exclusion constraint so the
-- migration can preserve any legacy conflicts already stored in the database.
ALTER TABLE appointments
  DROP CONSTRAINT appointments_no_confirmed_overlap;

CREATE OR REPLACE FUNCTION enforce_global_confirmed_appointment_buffer()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' THEN
    PERFORM pg_advisory_xact_lock(hashtext('clinicflow:confirmed-schedule'));

    IF EXISTS (
      SELECT 1
      FROM appointments
      WHERE status = 'confirmed'
        AND id IS DISTINCT FROM NEW.id
        AND appointment_date > NEW.appointment_date - INTERVAL '30 minutes'
        AND appointment_date < NEW.appointment_date + INTERVAL '30 minutes'
    ) THEN
      RAISE EXCEPTION USING
        ERRCODE = '23P01',
        MESSAGE = 'The clinic already has a confirmed appointment within 30 minutes of this time',
        CONSTRAINT = 'appointments_global_confirmed_buffer';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appointments_global_confirmed_buffer
  BEFORE INSERT OR UPDATE OF appointment_date, status ON appointments
  FOR EACH ROW EXECUTE FUNCTION enforce_global_confirmed_appointment_buffer();

COMMIT;
