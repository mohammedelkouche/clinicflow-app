import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { listAppointments } from "../api/appointments.api.js";
import { getPatient } from "../api/patients.api.js";
import StatusBadge from "../components/StatusBadge.jsx";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(
    new Date(`${value.slice(0, 10)}T00:00:00`),
  );
}

function formatAppointmentDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function PatientDetailsPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadPatientDetails() {
      try {
        const [patientRecord, appointmentResult] = await Promise.all([
          getPatient(id),
          listAppointments({ patientId: id, page: 1, limit: 100 }),
        ]);

        if (isActive) {
          setPatient(patientRecord);
          setAppointments(appointmentResult.data);
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError.response?.data?.error?.message ??
              "Unable to load this patient record.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadPatientDetails();

    return () => {
      isActive = false;
    };
  }, [id, requestKey]);

  function retryLoading() {
    setError("");
    setIsLoading(true);
    setRequestKey((currentKey) => currentKey + 1);
  }

  if (isLoading) {
    return (
      <div className="detail-state" role="status">
        <span className="spinner" aria-hidden="true" />
        <p>Loading patient details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <section className="page-shell">
        <Link className="back-link" to="/patients">
          ← Back to patients
        </Link>
        <div className="page-error" role="alert">
          <div>
            <h2>Patient record unavailable</h2>
            <p>{error}</p>
          </div>
          <button
            className="button button--quiet"
            type="button"
            onClick={retryLoading}
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <Link className="back-link" to="/patients">
        ← Back to patients
      </Link>

      <header className="detail-header">
        <div className="detail-identity">
          <span className="detail-avatar" aria-hidden="true">
            {patient.fullName.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="eyebrow">Patient record</p>
            <h1>{patient.fullName}</h1>
            <span className="cin-chip">{patient.cin}</span>
          </div>
        </div>
        <Link
          className="button button--primary button-link"
          to={`/appointments?patientId=${patient.id}`}
        >
          + Add appointment
        </Link>
      </header>

      <div className="patient-detail-grid">
        <section className="detail-card" aria-labelledby="patient-info-title">
          <h2 id="patient-info-title">Patient information</h2>
          <dl className="detail-list">
            <div>
              <dt>Phone</dt>
              <dd>{patient.phone}</dd>
            </div>
            <div>
              <dt>Birth date</dt>
              <dd>{formatDate(patient.birthDate)}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{patient.address || "Not provided"}</dd>
            </div>
          </dl>
        </section>

        <section
          className="detail-card detail-card--appointments"
          aria-labelledby="patient-appointments-title"
        >
          <div className="detail-card__heading">
            <div>
              <p className="eyebrow">Visit history</p>
              <h2 id="patient-appointments-title">Appointments</h2>
            </div>
            <span className="count-pill">{appointments.length}</span>
          </div>

          {appointments.length === 0 ? (
            <div className="appointment-empty">
              <p>No appointments found for this patient.</p>
            </div>
          ) : (
            <div className="appointment-list">
              {appointments.map((appointment) => (
                <article className="appointment-row" key={appointment.id}>
                  <div className="appointment-date">
                    <strong>
                      {formatAppointmentDate(appointment.appointmentDate)}
                    </strong>
                    <span>{appointment.reason}</span>
                  </div>
                  <StatusBadge status={appointment.status} />
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default PatientDetailsPage;
