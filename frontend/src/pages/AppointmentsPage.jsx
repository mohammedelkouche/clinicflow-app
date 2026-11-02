import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

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
  const [arePatientsLoading, setArePatientsLoading] = useState(true);
  const [patientOptionsError, setPatientOptionsError] = useState("");
  const [patientOptionsRequestKey, setPatientOptionsRequestKey] = useState(0);
  const [meta, setMeta] = useState(initialMeta);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(Boolean(initialPatientId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function loadPatientOptions() {
      try {
        const result = await listPatients({ search: "", page: 1, limit: 100 });
        if (isActive) {
          setPatients(result.data);
          setPatientOptionsError("");
        }
      } catch (requestError) {
        if (isActive) {
          setPatientOptionsError(
            getRequestError(requestError, "Unable to load patient options."),
          );
          toast.error(
            getRequestError(requestError, "Unable to load patient options."),
            { id: "patient-options-error" },
          );
        }
      } finally {
        if (isActive) {
          setArePatientsLoading(false);
        }
      }
    }

    loadPatientOptions();

    return () => {
      isActive = false;
    };
  }, [patientOptionsRequestKey]);

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
          setHasLoadError(false);
        }
      } catch (requestError) {
        if (isActive) {
          setHasLoadError(true);
          toast.error(
            getRequestError(requestError, "Unable to load appointments."),
            { id: "appointments-load-error" },
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
    setHasLoadError(false);
    setIsLoading(true);
    setRefreshKey((currentKey) => currentKey + 1);
  }

  function handleFilterChange(setFilter) {
    return (event) => {
      setFilter(event.target.value);
      setPage(1);
      setHasLoadError(false);
      setIsLoading(true);
    };
  }

  function clearFilters() {
    setDateFilter("");
    setStatusFilter("");
    setPage(1);
    setHasLoadError(false);
    setIsLoading(true);
  }

  function openForm() {
    setIsFormOpen(true);
  }

  function retryPatientOptions() {
    setPatientOptionsError("");
    setArePatientsLoading(true);
    setPatientOptionsRequestKey((currentKey) => currentKey + 1);
  }

  function closeForm() {
    setIsFormOpen(false);
    if (initialPatientId) {
      setSearchParams({}, { replace: true });
    }
  }

  async function handleCreate(values) {
    setIsSubmitting(true);

    try {
      await createAppointment(values);
      toast.success("Appointment scheduled.");
      closeForm();

      if (page !== 1) {
        setPage(1);
        setIsLoading(true);
      } else {
        refreshAppointments();
      }
    } catch (requestError) {
      toast.error(
        getRequestError(requestError, "Unable to schedule this appointment."),
        { duration: 6500 },
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(appointmentId, status) {
    setUpdatingId(appointmentId);

    try {
      await updateAppointmentStatus(appointmentId, status);
      toast.success("Appointment status updated.");
      refreshAppointments();
    } catch (requestError) {
      toast.error(
        getRequestError(
          requestError,
          "Unable to update the appointment status.",
        ),
        { duration: 6500 },
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
    setHasLoadError(false);
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

      <div className="data-card" aria-busy={isLoading}>
        {isLoading ? (
          <div className="table-state" role="status">
            <span className="spinner" aria-hidden="true" />
            <p>Loading appointments…</p>
          </div>
        ) : hasLoadError ? (
          <div className="table-state">
            <h2>Appointments unavailable</h2>
            <p>Use the notification for details, then try again.</p>
            <button
              className="button button--quiet"
              type="button"
              onClick={refreshAppointments}
            >
              Try again
            </button>
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
                          handleStatusChange(appointment.id, event.target.value)
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

      {!isLoading && !hasLoadError ? (
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
              arePatientsLoading={arePatientsLoading}
              patientOptionsError={patientOptionsError}
              isSubmitting={isSubmitting}
              onCancel={closeForm}
              onRetryPatients={retryPatientOptions}
              onSubmit={handleCreate}
            />
          </section>
        </div>
      ) : null}
    </section>
  );
}

export default AppointmentsPage;
