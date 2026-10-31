import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  createAppointment,
  listAppointments,
  updateAppointmentStatus,
} from "../api/appointments.api.js";
import { listPatients } from "../api/patients.api.js";
import AppointmentForm from "../components/AppointmentForm.jsx";
import Pagination from "../components/Pagination.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const initialMeta = { page: 1, limit: 10, total: 0, totalPages: 0 };

function getRequestError(error, fallback) {
  return error.response?.data?.error?.message ?? fallback;
}

function formatAppointmentDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function AppointmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPatientId = searchParams.get("patientId") ?? "";
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [meta, setMeta] = useState(initialMeta);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(Boolean(initialPatientId));
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function loadPatientOptions() {
      try {
        const result = await listPatients({ search: "", page: 1, limit: 100 });
        if (isActive) {
          setPatients(result.data);
        }
      } catch (requestError) {
        if (isActive) {
          setFormError(
            getRequestError(requestError, "Unable to load patient options."),
          );
        }
      }
    }

    loadPatientOptions();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadAppointments() {
      try {
        const result = await listAppointments({
          date: dateFilter || undefined,
          status: statusFilter || undefined,
          page,
          limit: 10,
        });

        if (isActive) {
          setAppointments(result.data);
          setMeta(result.meta);
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            getRequestError(requestError, "Unable to load appointments."),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadAppointments();

    return () => {
      isActive = false;
    };
  }, [dateFilter, page, refreshKey, statusFilter]);

  function refreshAppointments() {
    setError("");
    setIsLoading(true);
    setRefreshKey((currentKey) => currentKey + 1);
  }

  function handleFilterChange(setFilter) {
    return (event) => {
      setFilter(event.target.value);
      setPage(1);
      setError("");
      setActionError("");
      setIsLoading(true);
    };
  }

  function clearFilters() {
    setDateFilter("");
    setStatusFilter("");
    setPage(1);
    setError("");
    setActionError("");
    setIsLoading(true);
  }

  function openForm() {
    setFormError("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setFormError("");
    if (initialPatientId) {
      setSearchParams({}, { replace: true });
    }
  }

  async function handleCreate(values) {
    setIsSubmitting(true);
    setFormError("");

    try {
      await createAppointment(values);
      closeForm();

      if (page !== 1) {
        setPage(1);
        setIsLoading(true);
      } else {
        refreshAppointments();
      }
    } catch (requestError) {
      setFormError(
        getRequestError(requestError, "Unable to schedule this appointment."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(appointmentId, status) {
    setUpdatingId(appointmentId);
    setActionError("");

    try {
      await updateAppointmentStatus(appointmentId, status);
      refreshAppointments();
    } catch (requestError) {
      setActionError(
        getRequestError(
          requestError,
          "Unable to update the appointment status.",
        ),
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
    setError("");
    setActionError("");
    setIsLoading(true);
  }

  return (
    <section className="page-shell">
      <header className="page-header appointment-page-header">
        <div>
          <p className="eyebrow">Clinic schedule</p>
          <h1>Appointments</h1>
          <p>
            Schedule visits, filter the clinic calendar, and update statuses.
          </p>
        </div>
        <button
          className="button button--primary"
          type="button"
          onClick={openForm}
        >
          + New appointment
        </button>
      </header>

      <div className="appointment-filters" aria-label="Appointment filters">
        <label className="filter-field">
          <span>Date</span>
          <input
            type="date"
            value={dateFilter}
            onInput={handleFilterChange(setDateFilter)}
          />
        </label>
        <label className="filter-field">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={handleFilterChange(setStatusFilter)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <button
          className="button button--quiet filter-clear"
          type="button"
          onClick={clearFilters}
          disabled={!dateFilter && !statusFilter}
        >
          Clear filters
        </button>
        <p>{meta.total} appointments</p>
      </div>

      {actionError ? (
        <div className="inline-alert" role="alert">
          <strong>Status was not changed</strong>
          <span>{actionError}</span>
          <button
            type="button"
            aria-label="Dismiss status error"
            onClick={() => setActionError("")}
          >
            ×
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="page-error" role="alert">
          <div>
            <h2>Appointments unavailable</h2>
            <p>{error}</p>
          </div>
          <button
            className="button button--quiet"
            type="button"
            onClick={refreshAppointments}
          >
            Try again
          </button>
        </div>
      ) : null}

      {!error ? (
        <div className="data-card" aria-busy={isLoading}>
          {isLoading ? (
            <div className="table-state" role="status">
              <span className="spinner" aria-hidden="true" />
              <p>Loading appointments…</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="table-state">
              <span className="empty-state__mark" aria-hidden="true">
                AP
              </span>
              <h2>No appointments found</h2>
              <p>Change the filters or schedule a new appointment.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="data-table appointment-table">
                <thead>
                  <tr>
                    <th scope="col">Patient</th>
                    <th scope="col">Date and time</th>
                    <th scope="col">Visit</th>
                    <th scope="col">Status</th>
                    <th scope="col">Update status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td data-label="Patient">
                        <strong className="appointment-patient">
                          {appointment.patientName}
                        </strong>
                      </td>
                      <td data-label="Date and time">
                        {formatAppointmentDate(appointment.appointmentDate)}
                      </td>
                      <td data-label="Visit">
                        <div className="visit-copy">
                          <strong>{appointment.reason}</strong>
                          {appointment.notes ? (
                            <small>{appointment.notes}</small>
                          ) : null}
                        </div>
                      </td>
                      <td data-label="Status">
                        <StatusBadge status={appointment.status} />
                      </td>
                      <td data-label="Update status">
                        <select
                          className="status-select"
                          value={appointment.status}
                          onChange={(event) =>
                            handleStatusChange(
                              appointment.id,
                              event.target.value,
                            )
                          }
                          disabled={updatingId === appointment.id}
                          aria-label={`Update status for ${appointment.patientName} on ${formatAppointmentDate(appointment.appointmentDate)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {!isLoading && !error ? (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          itemLabel="appointments"
          ariaLabel="Appointment list pagination"
          onPageChange={handlePageChange}
        />
      ) : null}

      {isFormOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal-card appointment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="appointment-form-title"
          >
            <header className="modal-header">
              <div>
                <p className="eyebrow">New visit</p>
                <h2 id="appointment-form-title">Schedule an appointment</h2>
              </div>
              <button
                className="modal-close"
                type="button"
                aria-label="Close appointment form"
                onClick={closeForm}
                disabled={isSubmitting}
              >
                ×
              </button>
            </header>
            <AppointmentForm
              patients={patients}
              initialPatientId={initialPatientId}
              isSubmitting={isSubmitting}
              serverError={formError}
              onCancel={closeForm}
              onSubmit={handleCreate}
            />
          </section>
        </div>
      ) : null}
    </section>
  );
}

export default AppointmentsPage;
