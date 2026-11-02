import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const initialValues = {
  patientId: "",
  appointmentDate: "",
  reason: "",
  notes: "",
  status: "pending",
};

function getMinimumAppointmentDateTime() {
  const minimumDate = new Date();
  minimumDate.setSeconds(0, 0);
  minimumDate.setMinutes(minimumDate.getMinutes() + 1);

  const localTime = new Date(
    minimumDate.getTime() - minimumDate.getTimezoneOffset() * 60_000,
  );

  return localTime.toISOString().slice(0, 16);
}

function AppointmentForm({
  patients,
  initialPatientId,
  arePatientsLoading,
  patientOptionsError,
  isSubmitting,
  onCancel,
  onRetryPatients,
  onSubmit,
}) {
  const [values, setValues] = useState(() => ({
    ...initialValues,
    patientId: initialPatientId ?? "",
  }));
  const [patientSearch, setPatientSearch] = useState("");
  const [minimumAppointmentDateTime, setMinimumAppointmentDateTime] = useState(
    getMinimumAppointmentDateTime,
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMinimumAppointmentDateTime(getMinimumAppointmentDateTime());
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const filteredPatients = useMemo(() => {
    const normalizedSearch = patientSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return patients;
    }

    return patients.filter(
      (patient) =>
        patient.fullName.toLowerCase().includes(normalizedSearch) ||
        patient.cin.toLowerCase().startsWith(normalizedSearch),
    );
  }, [patientSearch, patients]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const appointmentDate = new Date(values.appointmentDate);

    if (
      Number.isNaN(appointmentDate.getTime()) ||
      appointmentDate.getTime() <= Date.now()
    ) {
      setMinimumAppointmentDateTime(getMinimumAppointmentDateTime());
      toast.error("Choose a future appointment date and time.");
      return;
    }

    onSubmit({
      ...values,
      appointmentDate: appointmentDate.toISOString(),
      notes: values.notes || null,
    });
  }

  return (
    <form className="appointment-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="form-field form-field--wide">
          <span>Find patient</span>
          <input
            type="search"
            value={patientSearch}
            onChange={(event) => setPatientSearch(event.target.value)}
            placeholder="Search by name or CIN"
            autoFocus
          />
        </label>

        <label className="form-field form-field--wide">
          <span>Patient</span>
          <select
            name="patientId"
            value={values.patientId}
            onChange={handleChange}
            disabled={
              arePatientsLoading ||
              Boolean(patientOptionsError) ||
              !patients.length
            }
            required
          >
            <option value="">
              {arePatientsLoading
                ? "Loading patients…"
                : patients.length
                  ? "Select a patient"
                  : "No patients available"}
            </option>
            {filteredPatients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.fullName} · {patient.cin}
              </option>
            ))}
          </select>
          {!arePatientsLoading &&
          !patientOptionsError &&
          patients.length > 0 &&
          filteredPatients.length === 0 ? (
            <small>No patients match this search.</small>
          ) : null}
        </label>

        <label className="form-field">
          <span>Date and time</span>
          <input
            name="appointmentDate"
            type="datetime-local"
            value={values.appointmentDate}
            onInput={handleChange}
            min={minimumAppointmentDateTime}
            step="60"
            required
          />
          <small>Past dates and elapsed times today are unavailable.</small>
        </label>

        <label className="form-field">
          <span>Initial status</span>
          <select name="status" value={values.status} onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <label className="form-field form-field--wide">
          <span>Reason</span>
          <input
            name="reason"
            value={values.reason}
            onChange={handleChange}
            maxLength={500}
            placeholder="Reason for the visit"
            required
          />
        </label>

        <label className="form-field form-field--wide">
          <span>
            Notes <small>Optional</small>
          </span>
          <textarea
            name="notes"
            value={values.notes}
            onChange={handleChange}
            maxLength={2000}
            rows={3}
            placeholder="Preparation notes or additional context"
          />
        </label>
      </div>

      {patientOptionsError ? (
        <div className="form-retry">
          <button
            className="button button--quiet"
            type="button"
            onClick={onRetryPatients}
          >
            Reload patient list
          </button>
        </div>
      ) : null}

      <div className="form-actions">
        <button
          className="button button--quiet"
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          className="button button--primary"
          type="submit"
          disabled={
            isSubmitting ||
            arePatientsLoading ||
            Boolean(patientOptionsError) ||
            !patients.length
          }
        >
          {isSubmitting ? "Scheduling…" : "Schedule appointment"}
        </button>
      </div>
    </form>
  );
}

export default AppointmentForm;
