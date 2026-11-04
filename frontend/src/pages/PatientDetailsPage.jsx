import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { listAppointments } from "../api/appointments.api.js";
import { getPatient } from "../api/patients.api.js";
import Pagination from "../components/Pagination.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import {
  card,
  eyebrow,
  focusRing,
  primaryButton,
  quietButton,
  spinner,
  tableState,
} from "../styles/ui.js";

const initialMeta = { page: 1, limit: 10, total: 0, totalPages: 0 };

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
  const [meta, setMeta] = useState(initialMeta);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadPatientDetails() {
      try {
        const [patientRecord, appointmentResult] = await Promise.all([
          getPatient(id),
          listAppointments({ patientId: id, page, limit: 10 }),
        ]);

        if (isActive) {
          setPatient(patientRecord);
          setAppointments(appointmentResult.data);
          setMeta(appointmentResult.meta);
          setHasError(false);
        }
      } catch (requestError) {
        if (isActive) {
          setHasError(true);
          toast.error(
            requestError.response?.data?.error?.message ??
              "Unable to load this patient record.",
            { id: "patient-details-load-error" },
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
  }, [id, page, requestKey]);

  function retryLoading() {
    setHasError(false);
    setIsLoading(true);
    setRequestKey((currentKey) => currentKey + 1);
  }

  if (isLoading) {
    return (
      <div className={tableState} role="status">
        <span className={spinner} aria-hidden="true" />
        <p>Loading patient details…</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <section>
        <Link
          className={`mb-5 inline-block font-bold text-clinic-700 no-underline ${focusRing}`}
          to="/patients"
        >
          ← Back to patients
        </Link>
        <div className={card}>
          <div className={tableState}>
            <h2 className="text-lg font-bold text-ink">
              Patient record unavailable
            </h2>
            <p className="mt-2">
              Use the notification for details, then try again.
            </p>
            <button
              className={`${quietButton} mt-4`}
              type="button"
              onClick={retryLoading}
            >
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <Link
        className={`mb-5 inline-block font-bold text-clinic-700 no-underline ${focusRing}`}
        to="/patients"
      >
        ← Back to patients
      </Link>

      <header className="mb-8 flex flex-col items-stretch justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4 sm:items-center">
          <span
            className="grid size-14 shrink-0 place-items-center rounded-full bg-clinic-100 text-xl font-extrabold text-clinic-800 sm:size-17 sm:text-2xl"
            aria-hidden="true"
          >
            {patient.fullName.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className={eyebrow}>Patient record</p>
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
              {patient.fullName}
            </h1>
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-bold tracking-wide text-slate-700">
              {patient.cin}
            </span>
          </div>
        </div>
        <Link
          className={`${primaryButton} no-underline`}
          to={`/appointments?patientId=${patient.id}`}
        >
          + Add appointment
        </Link>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(16rem,0.65fr)_minmax(22rem,1.35fr)]">
        <section className={`${card} p-6`} aria-labelledby="patient-info-title">
          <h2
            className="mb-4 text-lg font-bold text-ink"
            id="patient-info-title"
          >
            Patient information
          </h2>
          <dl>
            <div className="grid gap-1 border-b border-slate-100 py-3">
              <dt className="text-xs font-bold tracking-wider text-muted uppercase">
                Phone
              </dt>
              <dd className="text-ink">{patient.phone}</dd>
            </div>
            <div className="grid gap-1 border-b border-slate-100 py-3">
              <dt className="text-xs font-bold tracking-wider text-muted uppercase">
                Birth date
              </dt>
              <dd className="text-ink">{formatDate(patient.birthDate)}</dd>
            </div>
            <div className="grid gap-1 py-3">
              <dt className="text-xs font-bold tracking-wider text-muted uppercase">
                Address
              </dt>
              <dd className="leading-6 text-ink">
                {patient.address || "Not provided"}
              </dd>
            </div>
          </dl>
        </section>

        <section
          className={`${card} p-6`}
          aria-labelledby="patient-appointments-title"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className={`${eyebrow} mb-0`}>Visit history</p>
              <h2
                className="text-lg font-bold text-ink"
                id="patient-appointments-title"
              >
                Appointments
              </h2>
            </div>
            <span className="grid min-h-8 min-w-8 place-items-center rounded-full bg-clinic-50 px-2 text-xs font-bold text-clinic-800">
              {meta.total}
            </span>
          </div>

          {appointments.length === 0 ? (
            <div className="py-10 text-center text-muted">
              <p>No appointments found for this patient.</p>
            </div>
          ) : (
            <div>
              {appointments.map((appointment) => (
                <article
                  className="flex flex-col items-start justify-between gap-3 border-b border-slate-100 py-4 last:border-b-0 sm:flex-row sm:items-center"
                  key={appointment.id}
                >
                  <div className="grid gap-1">
                    <strong className="text-sm text-ink">
                      {formatAppointmentDate(appointment.appointmentDate)}
                    </strong>
                    <span className="text-sm text-muted">
                      {appointment.reason}
                    </span>
                  </div>
                  <StatusBadge status={appointment.status} />
                </article>
              ))}
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                itemLabel="appointments"
                ariaLabel="Patient appointment history pagination"
                onPageChange={(nextPage) => {
                  setPage(nextPage);
                  setIsLoading(true);
                }}
              />
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default PatientDetailsPage;
