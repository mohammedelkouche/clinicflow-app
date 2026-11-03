import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { createUser, listUsers } from "../api/users.api.js";
import Pagination from "../components/Pagination.jsx";
import UserForm from "../components/UserForm.jsx";
import { useDebounce } from "../hooks/useDebounce.js";
import {
  card,
  emptyMark,
  eyebrow,
  modalBackdrop,
  modalCard,
  modalClose,
  modalHeader,
  pageDescription,
  pageHeader,
  pageTitle,
  primaryButton,
  quietButton,
  rolePill,
  searchControl,
  spinner,
  table,
  tableState,
  tableWrap,
} from "../styles/ui.js";

const initialMeta = { page: 1, limit: 10, total: 0, totalPages: 0 };

function getRequestError(error, fallback) {
  return error.response?.data?.error?.message ?? fallback;
}

function formatCreatedAt(value) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(initialMeta);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    let isActive = true;

    async function loadUsers() {
      try {
        const result = await listUsers({
          search: debouncedSearch,
          page,
          limit: 10,
        });
        if (isActive) {
          setUsers(result.data);
          setMeta(result.meta);
          setHasLoadError(false);
        }
      } catch (requestError) {
        if (isActive) {
          setHasLoadError(true);
          toast.error(getRequestError(requestError, "Unable to load users."), {
            id: "users-load-error",
          });
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadUsers();
    return () => {
      isActive = false;
    };
  }, [debouncedSearch, page, refreshKey]);

  function refreshUsers() {
    setIsLoading(true);
    setHasLoadError(false);
    setRefreshKey((currentKey) => currentKey + 1);
  }

  async function handleCreate(values) {
    setIsSubmitting(true);
    try {
      await createUser(values);
      setIsFormOpen(false);
      toast.success("User account created.");
      setIsLoading(true);
      if (page !== 1) setPage(1);
      else refreshUsers();
    } catch (requestError) {
      toast.error(getRequestError(requestError, "Unable to create the user."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <header className={`${pageHeader} sm:items-center`}>
        <div>
          <p className={eyebrow}>Access control</p>
          <h1 className={pageTitle}>Users</h1>
          <p className={pageDescription}>Create and review staff or administrator accounts.</p>
        </div>
        <button
          className={`${primaryButton} w-full sm:w-auto`}
          type="button"
          onClick={() => setIsFormOpen(true)}
        >
          + Add user
        </button>
      </header>

      <div className="mb-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <label className="relative w-full max-w-md" htmlFor="user-search">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-xl text-muted" aria-hidden="true">
            ⌕
          </span>
          <input
            id="user-search"
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
              setIsLoading(true);
            }}
            placeholder="Search by name or email"
            className={searchControl}
          />
        </label>
        <p className="text-sm whitespace-nowrap text-muted">{meta.total} user accounts</p>
      </div>

      <div className={card} aria-busy={isLoading}>
        {isLoading ? (
          <div className={tableState} role="status">
            <span className={spinner} aria-hidden="true" />
            <p>Loading users…</p>
          </div>
        ) : hasLoadError ? (
          <div className={tableState}>
            <h2 className="text-lg font-bold text-ink">Users unavailable</h2>
            <p className="mt-2">Use the notification for details, then try again.</p>
            <button
              className={`${quietButton} mt-4`}
              type="button"
              onClick={refreshUsers}
            >
              Try again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className={tableState}>
            <span className={emptyMark} aria-hidden="true">
              US
            </span>
            <h2 className="mt-4 text-lg font-bold text-ink">No users found</h2>
            <p className="mt-2">Change the search or create a user account.</p>
          </div>
        ) : (
          <div className={tableWrap}>
            <table className={table}>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td data-label="Name">
                      <strong>{user.fullName}</strong>
                    </td>
                    <td data-label="Email">{user.email}</td>
                    <td data-label="Role">
                      <span className={rolePill}>{user.role}</span>
                    </td>
                    <td data-label="Created">
                      {formatCreatedAt(user.createdAt)}
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
          itemLabel="users"
          ariaLabel="User list pagination"
          onPageChange={(nextPage) => {
            setPage(nextPage);
            setIsLoading(true);
          }}
        />
      ) : null}

      {isFormOpen ? (
        <div className={modalBackdrop} role="presentation">
          <section
            className={modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-form-title"
          >
            <header className={modalHeader}>
              <div>
                <p className={eyebrow}>New account</p>
                <h2 className="text-2xl font-extrabold text-ink" id="user-form-title">Create a user</h2>
              </div>
              <button
                className={modalClose}
                type="button"
                aria-label="Close user form"
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitting}
              >
                ×
              </button>
            </header>
            <UserForm
              isSubmitting={isSubmitting}
              onCancel={() => setIsFormOpen(false)}
              onSubmit={handleCreate}
            />
          </section>
        </div>
      ) : null}
    </section>
  );
}

export default UsersPage;
