import { quietButton } from "../styles/ui.js";

function Pagination({
  page,
  totalPages,
  total,
  itemLabel = "items",
  ariaLabel = "Pagination",
  onPageChange,
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="mt-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center" aria-label={ariaLabel}>
      <p className="text-sm text-muted">
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        <span>
          {" "}
          · {total} {itemLabel}
        </span>
      </p>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <button
          className={quietButton}
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <button
          className={quietButton}
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
