import toast from "react-hot-toast";

export function confirmToast({ title, message, confirmLabel = "Confirm" }) {
  return new Promise((resolve) => {
    toast.custom(
      (toastItem) => (
        <div className="toast-confirm" role="alertdialog" aria-modal="true">
          <div>
            <strong>{title}</strong>
            <p>{message}</p>
          </div>
          <div className="toast-confirm__actions">
            <button
              className="button button--quiet"
              type="button"
              onClick={() => {
                toast.dismiss(toastItem.id);
                resolve(false);
              }}
            >
              Cancel
            </button>
            <button
              className="button button--danger"
              type="button"
              onClick={() => {
                toast.dismiss(toastItem.id);
                resolve(true);
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      ),
      { duration: Number.POSITIVE_INFINITY },
    );
  });
}
