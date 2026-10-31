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
    <nav className="pagination" aria-label={ariaLabel}>
      <p>
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        <span>
          {" "}
          · {total} {itemLabel}
        </span>
      </p>
      <div className="pagination__actions">
        <button
          className="button button--quiet"
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <button
          className="button button--quiet"
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
