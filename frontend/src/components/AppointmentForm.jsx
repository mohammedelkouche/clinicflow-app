import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  formActions,
  formControl,
  formField,
  formGrid,
  primaryButton,
  quietButton,
} from "../styles/ui.js";

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
  onPatientSearchChange,
  onRetryPatients,
  onSubmit,
}) {
  const [values, setValues] = useState(() => ({
    ...initialValues,
    patientId: initialPatientId ?? "",
  }));
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [minimumAppointmentDateTime, setMinimumAppointmentDateTime] = useState(
    getMinimumAppointmentDateTime,
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMinimumAppointmentDateTime(getMinimumAppointmentDateTime());
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const patientOptions =
    selectedPatient &&
    !patients.some((patient) => patient.id === selectedPatient.id)
      ? [selectedPatient, ...patients]
      : patients;

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  function handlePatientChange(event) {
    handleChange(event);
    setSelectedPatient(
      patientOptions.find((patient) => patient.id === event.target.value) ??
        null,
    );
  }

  function handlePatientSearch(event) {
    const nextSearch = event.target.value;

    if (values.patientId && !selectedPatient) {
      setSelectedPatient(
        patients.find((patient) => patient.id === values.patientId) ?? null,
      );
    }

    setPatientSearch(nextSearch);
    onPatientSearchChange(nextSearch);
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
    <form onSubmit={handleSubmit}>
      <div className={formGrid}>
        <label className={`${formField} sm:col-span-2`}>
          <span>Find patient</span>
          <input
            type="search"
            value={patientSearch}
            onChange={handlePatientSearch}
            placeholder="Search by name or CIN"
            autoFocus
            className={formControl}
          />
        </label>

        <label className={`${formField} sm:col-span-2`}>
          <span>Patient</span>
          <select
            name="patientId"
            value={values.patientId}
            onChange={handlePatientChange}
            disabled={
              arePatientsLoading ||
              Boolean(patientOptionsError) ||
              !patientOptions.length
            }
            required
            className={formControl}
          >
            <option value="">
              {arePatientsLoading
                ? "Loading patients…"
                : patientOptions.length
                  ? "Select a patient"
                  : "No patients available"}
            </option>
            {patientOptions.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.fullName} · {patient.cin}
              </option>
            ))}
          </select>
          {!arePatientsLoading &&
          !patientOptionsError &&
          patientSearch.trim() &&
          patients.length === 0 ? (
            <small className="font-normal text-muted">
              No patients match this search.
            </small>
          ) : null}
        </label>

        <label className={formField}>
          <span>Date and time</span>
          <input
            name="appointmentDate"
            type="datetime-local"
            value={values.appointmentDate}
            onInput={handleChange}
            min={minimumAppointmentDateTime}
            step="60"
            required
            className={formControl}
          />
          <small className="font-normal leading-5 text-muted">
            Past dates and elapsed times today are unavailable.
          </small>
        </label>

        <label className={formField}>
          <span>Initial status</span>
          <select
            className={formControl}
            name="status"
            value={values.status}
            onChange={handleChange}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <label className={`${formField} sm:col-span-2`}>
          <span>Reason</span>
          <input
            name="reason"
            value={values.reason}
            onChange={handleChange}
            maxLength={500}
            placeholder="Reason for the visit"
            required
            className={formControl}
          />
        </label>

        <label className={`${formField} sm:col-span-2`}>
          <span>
            Notes{" "}
            <small className="ml-1 font-normal text-muted">Optional</small>
          </span>
          <textarea
            name="notes"
            value={values.notes}
            onChange={handleChange}
            maxLength={2000}
            rows={3}
            placeholder="Preparation notes or additional context"
            className={`${formControl} resize-y`}
          />
        </label>
      </div>

      {patientOptionsError ? (
        <div className="mt-4">
          <button
            className={quietButton}
            type="button"
            onClick={onRetryPatients}
          >
            Reload patient list
          </button>
        </div>
      ) : null}

      <div className={formActions}>
        <button
          className={quietButton}
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          className={primaryButton}
          type="submit"
          disabled={
            isSubmitting ||
            arePatientsLoading ||
            Boolean(patientOptionsError) ||
            !patientOptions.length
          }
        >
          {isSubmitting ? "Scheduling…" : "Schedule appointment"}
        </button>
      </div>
    </form>
  );
}

export default AppointmentForm;
