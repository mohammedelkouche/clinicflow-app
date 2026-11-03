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
import {
  card,
  emptyMark,
  eyebrow,
  focusRing,
  modalBackdrop,
  modalCard,
  modalClose,
  modalHeader,
  pageDescription,
  pageHeader,
  pageTitle,
  primaryButton,
  quietButton,
  searchControl,
  spinner,
  table,
  tableState,
  tableWrap,
  textButton,
} from "../styles/ui.js";

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
    <section>
      <header className={`${pageHeader} sm:items-center`}>
        <div>
          <p className={eyebrow}>Patient records</p>
          <h1 className={pageTitle}>Patients</h1>
          <p className={pageDescription}>Search, review, and maintain your clinic's patient records.</p>
        </div>
        <button
          className={`${primaryButton} w-full sm:w-auto`}
          type="button"
          onClick={openCreateForm}
        >
          + Add patient
        </button>
      </header>

      <div className="mb-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <label className="relative w-full max-w-md" htmlFor="patient-search">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-xl text-muted" aria-hidden="true">
            ⌕
          </span>
          <input
            id="patient-search"
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or CIN"
            className={searchControl}
          />
        </label>
        <p className="text-sm whitespace-nowrap text-muted">{meta.total} patient records</p>
      </div>

      <div className={card} aria-busy={isLoading}>
        {isLoading ? (
          <div className={tableState} role="status">
            <span className={spinner} aria-hidden="true" />
            <p>Loading patient records…</p>
          </div>
        ) : hasLoadError ? (
          <div className={tableState}>
            <h2 className="text-lg font-bold text-ink">Patient records unavailable</h2>
            <p className="mt-2">Use the notification for details, then try again.</p>
            <button
              className={`${quietButton} mt-4`}
              type="button"
              onClick={refreshPatients}
            >
              Try again
            </button>
          </div>
        ) : patients.length === 0 ? (
          <div className={tableState}>
            <span className={emptyMark} aria-hidden="true">
              PT
            </span>
            <h2 className="mt-4 text-lg font-bold text-ink">{search ? "No matching patients" : "No patients yet"}</h2>
            <p className="mt-2">
              {search
                ? "Try a different name or CIN."
                : "Add the first patient record to get started."}
            </p>
          </div>
        ) : (
          <div className={tableWrap}>
            <table className={table}>
              <thead>
                <tr>
                  <th scope="col">Patient</th>
                  <th scope="col">CIN</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Birth date</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td data-label="Patient">
                      <Link
                        className={`inline-flex items-center gap-3 no-underline ${focusRing}`}
                        to={`/patients/${patient.id}`}
                      >
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-clinic-100 font-extrabold text-clinic-800" aria-hidden="true">
                          {patient.fullName.charAt(0).toUpperCase()}
                        </span>
                        <span className="grid gap-0.5">
                          <strong className="text-sm text-ink">{patient.fullName}</strong>
                          <small className="text-xs text-muted">View patient details</small>
                        </span>
                      </Link>
                    </td>
                    <td data-label="CIN">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-bold tracking-wide text-slate-700">{patient.cin}</span>
                    </td>
                    <td data-label="Phone">{patient.phone}</td>
                    <td data-label="Birth date">
                      {formatBirthDate(patient.birthDate)}
                    </td>
                    <td className="whitespace-nowrap text-right" data-label="Actions">
                      <Link
                        className={textButton}
                        to={`/patients/${patient.id}`}
                      >
                        View
                      </Link>
                      <button
                        className={textButton}
                        type="button"
                        onClick={() => openEditForm(patient)}
                      >
                        Edit
                      </button>
                      {user.role === "admin" ? (
                        <button
                          className={`${textButton} text-red-700`}
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
        <div className={modalBackdrop} role="presentation">
          <section
            className={modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="patient-form-title"
          >
            <header className={modalHeader}>
              <div>
                <p className={eyebrow}>
                  {editingPatient ? "Update record" : "New record"}
                </p>
                <h2 className="text-2xl font-extrabold text-ink" id="patient-form-title">
                  {editingPatient ? "Edit patient" : "Add a patient"}
                </h2>
              </div>
              <button
                className={modalClose}
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
