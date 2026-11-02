import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  createPatient,
  deletePatient,
  listPatients,
  updatePatient,
} from "../api/patients.api.js";
import Pagination from "../components/Pagination.jsx";
import PatientForm from "../components/PatientForm.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useDebounce } from "../hooks/useDebounce.js";
import { confirmToast } from "../utils/toastConfirm.jsx";

const initialMeta = { page: 1, limit: 10, total: 0, totalPages: 0 };

function formatBirthDate(value) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
    new Date(`${value.slice(0, 10)}T00:00:00`),
  );
}

function getRequestError(error, fallback) {
  return error.response?.data?.error?.message ?? fallback;
}

function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [meta, setMeta] = useState(initialMeta);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    let isActive = true;

    async function loadPatients() {
      try {
        const result = await listPatients({
          search: debouncedSearch,
          page,
          limit: 10,
        });

        if (isActive) {
          setPatients(result.data);
          setMeta(result.meta);
          setHasLoadError(false);
        }
      } catch (requestError) {
        if (isActive) {
          setHasLoadError(true);
          toast.error(
            getRequestError(requestError, "Unable to load patient records."),
            { id: "patients-load-error" },
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadPatients();

    return () => {
      isActive = false;
    };
  }, [debouncedSearch, page, refreshKey]);

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setPage(1);
    setHasLoadError(false);
    setIsLoading(true);
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
    setHasLoadError(false);
    setIsLoading(true);
  }

  function openCreateForm() {
    setEditingPatient(null);
    setIsFormOpen(true);
  }

  function openEditForm(patient) {
    setEditingPatient(patient);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingPatient(null);
  }

  function refreshPatients() {
    setHasLoadError(false);
    setIsLoading(true);
    setRefreshKey((currentKey) => currentKey + 1);
  }

  async function handleFormSubmit(values) {
    setIsSubmitting(true);
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, values);
        toast.success("Patient record updated.");
      } else {
        await createPatient(values);
        toast.success("Patient record created.");
      }

      const wasEditing = Boolean(editingPatient);
      closeForm();

      if (!wasEditing && page !== 1) {
        setPage(1);
        setIsLoading(true);
      } else {
        refreshPatients();
      }
    } catch (requestError) {
      toast.error(
        getRequestError(requestError, "Unable to save the patient record."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(patient) {
    const confirmed = await confirmToast({
      title: `Delete ${patient.fullName}?`,
      message: "This also deletes every appointment for this patient.",
      confirmLabel: "Delete patient",
    });

    if (!confirmed) {
      return;
    }

    setDeletingId(patient.id);
    setHasLoadError(false);

    try {
      await deletePatient(patient.id);
      toast.success("Patient record deleted.");

      if (patients.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
        setIsLoading(true);
      } else {
        refreshPatients();
      }
    } catch (requestError) {
      toast.error(
        getRequestError(requestError, "Unable to delete the patient record."),
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="page-shell">
      <header className="page-header patient-page-header">
        <div>
          <p className="eyebrow">Patient records</p>
          <h1>Patients</h1>
          <p>Search, review, and maintain your clinic's patient records.</p>
        </div>
        <button
          className="button button--primary"
          type="button"
          onClick={openCreateForm}
        >
          + Add patient
        </button>
      </header>

      <div className="patient-toolbar">
        <label className="search-field" htmlFor="patient-search">
          <span className="search-field__icon" aria-hidden="true">
            ⌕
          </span>
          <input
            id="patient-search"
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or CIN"
          />
        </label>
        <p>{meta.total} patient records</p>
      </div>

      <div className="data-card" aria-busy={isLoading}>
        {isLoading ? (
          <div className="table-state" role="status">
            <span className="spinner" aria-hidden="true" />
            <p>Loading patient records…</p>
          </div>
        ) : hasLoadError ? (
          <div className="table-state">
            <h2>Patient records unavailable</h2>
            <p>Use the notification for details, then try again.</p>
            <button
              className="button button--quiet"
              type="button"
              onClick={refreshPatients}
            >
              Try again
            </button>
          </div>
        ) : patients.length === 0 ? (
          <div className="table-state">
            <span className="empty-state__mark" aria-hidden="true">
              PT
            </span>
            <h2>{search ? "No matching patients" : "No patients yet"}</h2>
            <p>
              {search
                ? "Try a different name or CIN."
                : "Add the first patient record to get started."}
            </p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Patient</th>
                  <th scope="col">CIN</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Birth date</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td data-label="Patient">
                      <Link
                        className="patient-link"
                        to={`/patients/${patient.id}`}
                      >
                        <span className="patient-avatar" aria-hidden="true">
                          {patient.fullName.charAt(0).toUpperCase()}
                        </span>
                        <span>
                          <strong>{patient.fullName}</strong>
                          <small>View patient details</small>
                        </span>
                      </Link>
                    </td>
                    <td data-label="CIN">
                      <span className="cin-chip">{patient.cin}</span>
                    </td>
                    <td data-label="Phone">{patient.phone}</td>
                    <td data-label="Birth date">
                      {formatBirthDate(patient.birthDate)}
                    </td>
                    <td className="row-actions" data-label="Actions">
                      <Link
                        className="text-button"
                        to={`/patients/${patient.id}`}
                      >
                        View
                      </Link>
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => openEditForm(patient)}
                      >
                        Edit
                      </button>
                      {user.role === "admin" ? (
                        <button
                          className="text-button text-button--danger"
                          type="button"
                          disabled={deletingId === patient.id}
                          onClick={() => handleDelete(patient)}
                        >
                          {deletingId === patient.id ? "Deleting…" : "Delete"}
                        </button>
                      ) : null}
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
          itemLabel="patients"
          ariaLabel="Patient list pagination"
          onPageChange={handlePageChange}
        />
      ) : null}

      {isFormOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="patient-form-title"
          >
            <header className="modal-header">
              <div>
                <p className="eyebrow">
                  {editingPatient ? "Update record" : "New record"}
                </p>
                <h2 id="patient-form-title">
                  {editingPatient ? "Edit patient" : "Add a patient"}
                </h2>
              </div>
              <button
                className="modal-close"
                type="button"
                aria-label="Close patient form"
                onClick={closeForm}
                disabled={isSubmitting}
              >
                ×
              </button>
            </header>
            <PatientForm
              key={editingPatient?.id ?? "new-patient"}
              patient={editingPatient}
              isSubmitting={isSubmitting}
              onCancel={closeForm}
              onSubmit={handleFormSubmit}
            />
          </section>
        </div>
      ) : null}
    </section>
  );
}

export default PatientsPage;
