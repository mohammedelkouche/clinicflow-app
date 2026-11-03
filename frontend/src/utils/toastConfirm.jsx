import toast from "react-hot-toast";
import { dangerButton, quietButton } from "../styles/ui.js";

export function confirmToast({ title, message, confirmLabel = "Confirm" }) {
  return new Promise((resolve) => {
    toast.custom(
      (toastItem) => (
        <div className="w-[min(90vw,28rem)] rounded-2xl border border-red-100 bg-white p-4 shadow-2xl" role="alertdialog" aria-modal="true">
          <div>
            <strong className="mb-1 block text-ink">{title}</strong>
            <p className="text-sm leading-6 text-muted">{message}</p>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className={quietButton}
              type="button"
              onClick={() => {
                toast.dismiss(toastItem.id);
                resolve(false);
              }}
            >
              Cancel
            </button>
            <button
              className={dangerButton}
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
